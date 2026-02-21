using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text.Json;

namespace KLL.BuildingBlocks.Infrastructure.HealthChecks;

public static class HealthCheckExtensions
{
    public static IServiceCollection AddKllHealthChecks(this IServiceCollection services, string connectionString,
        string? redisConnection = null, string? kafkaBootstrap = null)
    {
        var builder = services.AddHealthChecks()
            .AddNpgSql(connectionString, name: "postgresql", tags: new[] { "db", "ready" });

        if (redisConnection != null)
            builder.AddRedis(redisConnection, name: "redis", tags: new[] { "cache", "ready" });

        if (kafkaBootstrap != null)
            builder.AddKafka(cfg => cfg.BootstrapServers = kafkaBootstrap, name: "kafka", tags: new[] { "messaging", "ready" });

        return services;
    }

    public static WebApplication MapKllHealthChecks(this WebApplication app)
    {
        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = async (context, report) =>
            {
                context.Response.ContentType = "application/json";
                var result = JsonSerializer.Serialize(new
                {
                    status = report.Status.ToString(),
                    checks = report.Entries.Select(e => new
                    {
                        name = e.Key,
                        status = e.Value.Status.ToString(),
                        duration = e.Value.Duration.TotalMilliseconds + "ms",
                        exception = e.Value.Exception?.Message
                    }),
                    totalDuration = report.TotalDuration.TotalMilliseconds + "ms"
                });
                await context.Response.WriteAsync(result);
            }
        });

        app.MapHealthChecks("/health/live", new HealthCheckOptions
        {
            Predicate = _ => false // Liveness: always healthy if app responds
        });

        app.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready")
        });

        return app;
    }
}
