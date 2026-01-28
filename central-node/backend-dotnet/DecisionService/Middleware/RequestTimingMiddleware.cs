using System.Diagnostics;

namespace DecisionService.Middleware;

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
        
        // Optimize: Add caching headers or other generic optimization headers here if needed
        context.Response.Headers.Append("X-Server-Time", DateTime.UtcNow.ToString("o"));

        await _next(context);

        watch.Stop();
        var elapsedMs = watch.ElapsedMilliseconds;

        _logger.LogInformation("Request {Method} {Path} took {ElapsedMs}ms", 
            context.Request.Method, context.Request.Path, elapsedMs);
    }
}
