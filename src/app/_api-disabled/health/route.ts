import { apiSuccess, apiError } from '../middleware';

const START_TIME = Date.now();

export async function GET() {
    try {
        const uptime = Date.now() - START_TIME;
        const memoryUsage = process.memoryUsage();

        let ollamaStatus = 'unknown';
        try {
            const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/tags';
            const baseUrl = ollamaUrl.replace('/api/chat', '/api/tags');
            const res = await fetch(baseUrl, { signal: AbortSignal.timeout(3000) });
            ollamaStatus = res.ok ? 'connected' : `error:${res.status}`;
        } catch {
            ollamaStatus = 'offline';
        }

        return apiSuccess({
            status: 'healthy',
            version: '0.1.0',
            timestamp: new Date().toISOString(),
            uptime: { ms: uptime, human: formatUptime(uptime) },
            memory: {
                heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`,
                heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(1)} MB`,
                rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(1)} MB`,
            },
            services: {
                ollama: ollamaStatus,
                database: 'sqlite-client',
                deployment: process.env.VERCEL ? 'vercel' : process.env.CF_PAGES ? 'cloudflare' : 'local',
            },
            environment: process.env.NODE_ENV || 'development',
        });
    } catch {
        return apiError('Health check failed', 500);
    }
}

function formatUptime(ms: number): string {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
}
