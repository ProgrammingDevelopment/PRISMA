import { NextRequest } from 'next/server';
import os from 'os';
import {
    apiSuccess, apiError, apiRateLimited,
    checkServerRateLimit, getClientIP,
} from '../middleware';

const START_TIME = Date.now();
const requestMetrics = {
    totalRequests: 0,
    errorCount: 0,
    avgResponseTime: 0,
    responseTimes: [] as number[],
};

export function trackRequest(responseTimeMs: number, isError: boolean = false) {
    requestMetrics.totalRequests++;
    if (isError) requestMetrics.errorCount++;

    requestMetrics.responseTimes.push(responseTimeMs);
    if (requestMetrics.responseTimes.length > 100) {
        requestMetrics.responseTimes.shift();
    }

    requestMetrics.avgResponseTime = requestMetrics.responseTimes.reduce((a, b) => a + b, 0) / requestMetrics.responseTimes.length;
}

export async function GET(req: NextRequest) {
    const ip = getClientIP(req);
    const rateCheck = checkServerRateLimit(ip, 30, 60000);
    if (!rateCheck.allowed) return apiRateLimited(rateCheck.resetAt);

    try {
        const uptime = Date.now() - START_TIME;
        const memoryUsage = process.memoryUsage();

        return apiSuccess({
            application: {
                name: 'PRISMA RT 04',
                version: '0.1.0',
                environment: process.env.NODE_ENV || 'development',
                uptime: { ms: uptime, hours: (uptime / 3600000).toFixed(2) },
            },
            performance: {
                totalRequests: requestMetrics.totalRequests,
                errorCount: requestMetrics.errorCount,
                errorRate: requestMetrics.totalRequests > 0
                    ? `${((requestMetrics.errorCount / requestMetrics.totalRequests) * 100).toFixed(2)}%`
                    : '0%',
                avgResponseTime: `${requestMetrics.avgResponseTime.toFixed(1)}ms`,
                p95ResponseTime: requestMetrics.responseTimes.length > 0
                    ? `${requestMetrics.responseTimes.sort((a, b) => a - b)[Math.floor(requestMetrics.responseTimes.length * 0.95)] || 0}ms`
                    : 'N/A',
            },
            memory: {
                heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`,
                heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(1)} MB`,
                rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(1)} MB`,
                external: `${(memoryUsage.external / 1024 / 1024).toFixed(1)} MB`,
                heapUsagePercent: `${((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(1)}%`,
            },
            system: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                cpuCount: os.cpus().length,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[Monitoring API] error:', error);
        return apiError('Monitoring data unavailable', 500);
    }
}
