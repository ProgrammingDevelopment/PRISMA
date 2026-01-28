using System.Diagnostics;

namespace OptimizationService.Middleware;

public class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestTimingMiddleware> _logger;

    public RequestTimingMiddleware(RequestDelegate next, ILogger<RequestTimingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var watch = Stopwatch.StartNew();
        
        // Add basic security headers while we are at it
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

        await _next(context);

        watch.Stop();
        var elapsedMs = watch.ElapsedMilliseconds;

        _logger.LogInformation("Optimization Request {Method} {Path} took {ElapsedMs}ms", 
            context.Request.Method, context.Request.Path, elapsedMs);
    }
}
