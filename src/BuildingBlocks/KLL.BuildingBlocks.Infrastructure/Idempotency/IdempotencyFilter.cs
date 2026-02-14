using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace KLL.BuildingBlocks.Infrastructure.Idempotency;

[AttributeUsage(AttributeTargets.Method)]
public class IdempotentAttribute : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var idempotencyKey = context.HttpContext.Request.Headers["X-Idempotency-Key"].FirstOrDefault();
        if (string.IsNullOrEmpty(idempotencyKey))
        {
            await next();
            return;
        }

        var store = context.HttpContext.RequestServices.GetService(typeof(IIdempotencyStore)) as IIdempotencyStore;
        if (store == null) { await next(); return; }

        var existing = await store.GetAsync(idempotencyKey);
        if (existing != null)
        {
            context.Result = new ContentResult
            {
                Content = existing.ResponseBody,
                ContentType = "application/json",
                StatusCode = existing.ResponseStatusCode
            };
            return;
        }

        var result = await next();

        if (result.Result is ObjectResult objResult)
        {
            await store.SaveAsync(new IdempotencyKey
            {
                Key = idempotencyKey,
                RequestType = context.ActionDescriptor.DisplayName ?? "unknown",
                ResponseBody = JsonSerializer.Serialize(objResult.Value),
                ResponseStatusCode = objResult.StatusCode ?? 200
            });
        }
    }
}