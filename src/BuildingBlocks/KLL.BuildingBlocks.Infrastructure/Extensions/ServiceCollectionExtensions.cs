using System.Reflection;
using FluentValidation;
using KLL.BuildingBlocks.CQRS.Behaviors;
using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.BuildingBlocks.EventBus.Kafka;
using KLL.BuildingBlocks.EventBus.RabbitMQ;
using KLL.BuildingBlocks.Infrastructure.Idempotency;
using KLL.BuildingBlocks.Infrastructure.Middleware;
using KLL.BuildingBlocks.Infrastructure.RealTime;
using KLL.BuildingBlocks.Infrastructure.Resilience;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace KLL.BuildingBlocks.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Register all KLL BuildingBlocks at once:
    /// MediatR + FluentValidation + Kafka + RabbitMQ + Redis + HealthChecks + Polly
    /// </summary>
    public static IServiceCollection AddKllBuildingBlocks(
        this IServiceCollection services, IConfiguration config, string serviceName,
        params Assembly[] assemblies)
    {
        // CQRS - MediatR + Validation pipeline
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblies(assemblies));
        services.AddValidatorsFromAssemblies(assemblies);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));

        // EventBus
        services.AddKafkaEventBus();
        services.AddRabbitMQNotifications();

        // Cache
        services.AddRedisCache(config);

        // Health checks
        services.AddKLLHealthChecks(config);

        // Resilience
        services.AddResiliencePolicies();

        return services;
    }

    public static IServiceCollection AddKafkaEventBus(this IServiceCollection services)
    {
        services.AddSingleton<IEventBus, KafkaEventBus>();
        return services;
    }

    public static IServiceCollection AddRabbitMQNotifications(this IServiceCollection services)
    {
        services.AddSingleton<INotificationBus, RabbitMQNotificationBus>();
        return services;
    }

    public static IServiceCollection AddRedisCache(this IServiceCollection services, IConfiguration config)
    {
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = config["Redis:Connection"] ?? "localhost:6381";
            options.InstanceName = "kll:";
        });
        return services;
    }

    public static IServiceCollection AddIdempotency(this IServiceCollection services)
    {
        services.AddSingleton<IIdempotencyStore, RedisIdempotencyStore>();
        return services;
    }

    public static IServiceCollection AddRealTimeNotifications(this IServiceCollection services)
    {
        services.AddSignalR();
        services.AddSingleton<IOrderNotifier, SignalROrderNotifier>();
        return services;
    }

    public static IServiceCollection AddKLLHealthChecks(this IServiceCollection services, IConfiguration config)
    {
        var connStr = config.GetConnectionString("DefaultConnection") ?? "";
        var redis = config["Redis:Connection"] ?? "localhost:6381";
        var kafka = config["Kafka:BootstrapServers"] ?? "localhost:39092";

        var builder = services.AddHealthChecks();

        if (!string.IsNullOrEmpty(connStr))
            builder.AddNpgSql(connStr, name: "postgresql", tags: ["db", "ready"]);

        builder.AddRedis(redis, name: "redis", tags: ["cache", "ready"]);
        builder.AddKafka(cfg => cfg.BootstrapServers = kafka, name: "kafka", tags: ["messaging", "ready"]);

        return services;
    }

    /// <summary>
    /// Configure Serilog from IConfiguration (for services that don't use IHostBuilder)
    /// </summary>
    public static IServiceCollection ConfigureSerilog(this IServiceCollection services, IConfiguration config)
    {
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithThreadId()
            .WriteTo.Console(outputTemplate:
                "[{Timestamp:HH:mm:ss} {Level:u3}] {CorrelationId} {Message:lj}{NewLine}{Exception}")
            .WriteTo.Seq(config["Seq:Url"] ?? "http://localhost:5342")
            .CreateLogger();

        return services;
    }

    /// <summary>
    /// Register the OutboxProcessor background service for a given DbContext
    /// </summary>
    public static IServiceCollection AddOutboxProcessor<TContext>(this IServiceCollection services)
        where TContext : DbContext
    {
        services.AddHostedService<Outbox.OutboxProcessor<TContext>>();
        return services;
    }

    /// <summary>
    /// Use standard KLL middleware pipeline
    /// </summary>
    public static WebApplication UseKllInfrastructure(this WebApplication app)
    {
        app.UseMiddleware<CorrelationIdMiddleware>();
        app.UseMiddleware<ExceptionMiddleware>();
        return app;
    }
}
