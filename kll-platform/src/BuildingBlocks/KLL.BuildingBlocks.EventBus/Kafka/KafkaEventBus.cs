using System.Text.Json;
using Confluent.Kafka;
using KLL.BuildingBlocks.EventBus.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace KLL.BuildingBlocks.EventBus.Kafka;

public class KafkaEventBus : IEventBus, IDisposable
{
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<KafkaEventBus> _logger;

    public KafkaEventBus(IConfiguration config, ILogger<KafkaEventBus> logger)
    {
        _logger = logger;
        var producerConfig = new ProducerConfig
        {
            BootstrapServers = config["Kafka:BootstrapServers"] ?? "localhost:39092",
            Acks = Acks.All,
            EnableIdempotence = true,
            MessageSendMaxRetries = 3,
            RetryBackoffMs = 1000
        };
        _producer = new ProducerBuilder<string, string>(producerConfig).Build();
    }

    public async Task PublishAsync<T>(T @event, CancellationToken ct = default) where T : class
    {
        var topic = typeof(T).Name.Replace("IntegrationEvent", "").Replace("Event", "").ToLowerInvariant();
        var key = Guid.NewGuid().ToString();
        var value = JsonSerializer.Serialize(@event, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

        await PublishAsync(topic, value, key, ct);
    }

    public async Task PublishAsync(string topic, string message, string? key = null, CancellationToken ct = default)
    {
        try
        {
            var result = await _producer.ProduceAsync(topic, new Message<string, string>
            {
                Key = key ?? Guid.NewGuid().ToString(),
                Value = message
            }, ct);

            _logger.LogInformation("Published to {Topic} partition {Partition} offset {Offset}",
                topic, result.Partition.Value, result.Offset.Value);
        }
        catch (ProduceException<string, string> ex)
        {
            _logger.LogError(ex, "Failed to publish to {Topic}", topic);
            throw;
        }
    }

    public void Dispose() => _producer?.Dispose();
}