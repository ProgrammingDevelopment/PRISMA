import { NextRequest } from 'next/server';
import {
    apiSuccess, apiError, apiRateLimited,
    checkServerRateLimit, getClientIP, sanitizeServerInput, addSecurityHeaders,
} from '../middleware';
import { NextResponse } from 'next/server';

interface RealTimeEvent {
    id: string;
    type: 'announcement' | 'security_alert' | 'chat_message' | 'system_status' | 'finance_update';
    data: unknown;
    timestamp: string;
    source: 'web' | 'telegram' | 'system';
}

const eventBuffer: RealTimeEvent[] = [];
const MAX_EVENTS = 50;
const sseClients = new Set<ReadableStreamDefaultController>();

function broadcastEvent(event: RealTimeEvent) {
    eventBuffer.unshift(event);
    if (eventBuffer.length > MAX_EVENTS) eventBuffer.pop();

    const sseData = `data: ${JSON.stringify(event)}\n\n`;
    for (const controller of sseClients) {
        try {
            controller.enqueue(new TextEncoder().encode(sseData));
        } catch {
            sseClients.delete(controller);
        }
    }
}

// SSE stream for real-time events
export async function GET(req: NextRequest) {
    const ip = getClientIP(req);
    const rateCheck = checkServerRateLimit(ip, 5, 60000);
    if (!rateCheck.allowed) return apiRateLimited(rateCheck.resetAt);

    const { searchParams } = new URL(req.url);
    const lastEventId = searchParams.get('lastEventId');

    const stream = new ReadableStream({
        start(controller) {
            sseClients.add(controller);

            const connectEvent = `data: ${JSON.stringify({
                type: 'connected',
                timestamp: new Date().toISOString(),
                activeClients: sseClients.size,
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(connectEvent));

            if (lastEventId) {
                const missedIndex = eventBuffer.findIndex(e => e.id === lastEventId);
                if (missedIndex > 0) {
                    const missedEvents = eventBuffer.slice(0, missedIndex);
                    for (const event of missedEvents.reverse()) {
                        const data = `data: ${JSON.stringify(event)}\n\n`;
                        controller.enqueue(new TextEncoder().encode(data));
                    }
                }
            }

            const heartbeat = setInterval(() => {
                try {
                    const ping = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString() })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(ping));
                } catch {
                    clearInterval(heartbeat);
                    sseClients.delete(controller);
                }
            }, 30000);

            req.signal.addEventListener('abort', () => {
                clearInterval(heartbeat);
                sseClients.delete(controller);
                controller.close();
            });
        },
        cancel() { },
    });

    const response = new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });

    return addSecurityHeaders(response);
}

// Push events to all connected clients
export async function POST(req: NextRequest) {
    const ip = getClientIP(req);
    const rateCheck = checkServerRateLimit(ip, 30, 60000);
    if (!rateCheck.allowed) return apiRateLimited(rateCheck.resetAt);

    try {
        const body = await req.json();
        const { type, data, source } = body;

        const validTypes = ['announcement', 'security_alert', 'chat_message', 'system_status', 'finance_update'];
        if (!type || !validTypes.includes(type)) {
            return apiError(`Invalid event type. Valid: ${validTypes.join(', ')}`, 422);
        }

        const validSources = ['web', 'telegram', 'system'];
        if (!source || !validSources.includes(source)) {
            return apiError(`Invalid source. Valid: ${validSources.join(', ')}`, 422);
        }

        if (!data) return apiError('Event data is required', 422);

        const sanitizedData = typeof data === 'string' ? sanitizeServerInput(data, 5000) : data;

        const event: RealTimeEvent = {
            id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type,
            data: sanitizedData,
            timestamp: new Date().toISOString(),
            source,
        };

        broadcastEvent(event);

        return apiSuccess({
            event,
            activeClients: sseClients.size,
            message: `Event broadcasted to ${sseClients.size} clients`,
        });
    } catch (error) {
        console.error('[WS API] POST error:', error);
        return apiError('Failed to broadcast event', 500);
    }
}
