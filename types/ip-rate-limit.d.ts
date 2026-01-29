declare module 'ip-rate-limit' {
    interface RateLimitOptions {
        window: number;
        max: number;
    }

    interface RateLimitResult {
        success: boolean;
        limit: number;
        remaining: number;
        reset: number;
    }

    export class RateLimit {
        constructor(options: RateLimitOptions);
        check(ip: string): RateLimitResult;
    }
}
