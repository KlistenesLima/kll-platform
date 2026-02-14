using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace KLL.BuildingBlocks.Infrastructure.Middleware;

public class IdempotencyMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<IdempotencyMiddleware> _logger;

    public IdempotencyMiddleware(RequestDelegate next, ILogger<IdempotencyMiddleware> logger)
    { _next = next; _logger = logger; }

    public async Task InvokeAsync(HttpContext context, IDistributedCache cache)
    {
        if (context.Request.Method != "POST" && context.Request.Method != "PUT")
        {
            await _next(context);
            return;
        }

        var idempotencyKey = context.Request.Headers["X-Idempotency-Key"].FirstOrDefault();
        if (string.IsNullOrEmpty(idempotencyKey))
        {
            await _next(context);
            return;
        }

        var cacheKey = $"idempotency:{idempotencyKey}";
        var cached = await cache.GetStringAsync(cacheKey);
        if (cached != null)
        {
            _logger.LogInformation("Idempotent request detected: {Key}", idempotencyKey);
            context.Response.StatusCode = 200;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(cached);
            return;
        }

        var originalBody = context.Response.Body;
        using var memStream = new MemoryStream();
        context.Response.Body = memStream;

        await _next(context);

        memStream.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(memStream).ReadToEndAsync();

        if (context.Response.StatusCode >= 200 && context.Response.StatusCode < 300)
        {
            await cache.SetStringAsync(cacheKey, responseBody, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            });
        }

        memStream.Seek(0, SeekOrigin.Begin);
        await memStream.CopyToAsync(originalBody);
        context.Response.Body = originalBody;
    }
}