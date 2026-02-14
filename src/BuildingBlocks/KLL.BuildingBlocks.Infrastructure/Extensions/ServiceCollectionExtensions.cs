using FluentValidation;
using HealthChecks.UI.Client;
using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.BuildingBlocks.EventBus.Kafka;
using KLL.BuildingBlocks.EventBus.Outbox;
using KLL.BuildingBlocks.EventBus.RabbitMQ;
using KLL.BuildingBlocks.Infrastructure.Behaviors;
using KLL.BuildingBlocks.Infrastructure.Resilience;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace KLL.BuildingBlocks.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddKllBuildingBlocks(this IServiceCollection services,
        IConfiguration config, string serviceName, params Assembly[] assemblies)
    {
        // MediatR + Behaviors
        services.AddMediatR(cfg =>
        {
            foreach (var asm in assemblies) cfg.RegisterServicesFromAssembly(asm);
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(PerformanceBehavior<,>));
        });

        // FluentValidation
        foreach (var asm in assemblies)
            services.AddValidatorsFromAssembly(asm);

        // Kafka EventBus
        services.AddSingleton<IEventBus, KafkaEventBus>();

        // RabbitMQ NotificationBus
        services.AddSingleton<INotificationBus, RabbitMQNotificationBus>();

        // Outbox Processor
        services.AddHostedService<OutboxProcessor>();

        // Redis Cache
        services.AddStackExchangeRedisCache(opt =>
        {
            opt.Configuration = config["Redis:Connection"] ?? "localhost:6381";
            opt.InstanceName = $"kll-{serviceName}-";
        });

        // Polly Resilience
        services.AddResiliencePolicies();

        // Health Checks
        var hcBuilder = services.AddHealthChecks();
        var pgConn = config.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrEmpty(pgConn)) hcBuilder.AddNpgSql(pgConn, name: "postgresql");
        var redisConn = config["Redis:Connection"];
        if (!string.IsNullOrEmpty(redisConn)) hcBuilder.AddRedis(redisConn, name: "redis");

        return services;
    }

    public static WebApplication UseKllInfrastructure(this WebApplication app)
    {
        app.UseMiddleware<KLL.BuildingBlocks.Infrastructure.Middleware.CorrelationIdMiddleware>();
        app.UseMiddleware<KLL.BuildingBlocks.Infrastructure.Middleware.ExceptionMiddleware>();
        app.UseMiddleware<KLL.BuildingBlocks.Infrastructure.Middleware.IdempotencyMiddleware>();

        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
        });

        return app;
    }
}