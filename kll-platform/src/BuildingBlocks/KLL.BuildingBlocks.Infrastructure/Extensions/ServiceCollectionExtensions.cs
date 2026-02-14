using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.BuildingBlocks.EventBus.Kafka;
using KLL.BuildingBlocks.Infrastructure.Idempotency;
using KLL.BuildingBlocks.Infrastructure.RealTime;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace KLL.BuildingBlocks.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddKafkaEventBus(this IServiceCollection services)
    {
        services.AddSingleton<IEventBus, KafkaEventBus>();
        return services;
    }

    public static IServiceCollection AddRedisCache(this IServiceCollection services, IConfiguration config)
    {
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = config.GetConnectionString("Redis") ?? "localhost:6381";
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
}