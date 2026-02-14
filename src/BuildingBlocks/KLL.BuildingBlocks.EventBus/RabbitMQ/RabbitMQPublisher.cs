using System.Text;
using System.Text.Json;
using KLL.BuildingBlocks.EventBus.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;

namespace KLL.BuildingBlocks.EventBus.RabbitMQ;

public class RabbitMQPublisher : INotificationPublisher, IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly ILogger<RabbitMQPublisher> _logger;

    public RabbitMQPublisher(IConfiguration config, ILogger<RabbitMQPublisher> logger)
    {
        _logger = logger;
        var factory = new ConnectionFactory
        {
            HostName = config["RabbitMQ:Host"] ?? "localhost",
            Port = int.Parse(config["RabbitMQ:Port"] ?? "5673"),
            UserName = config["RabbitMQ:Username"] ?? "kll",
            Password = config["RabbitMQ:Password"] ?? "kll123",
            AutomaticRecoveryEnabled = true,
            NetworkRecoveryInterval = TimeSpan.FromSeconds(10)
        };
        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        // Declare queues with DLQ
        var dlqArgs = new Dictionary<string, object>
        {
            { "x-dead-letter-exchange", "" },
            { "x-dead-letter-routing-key", "kll.dlq" }
        };

        _channel.QueueDeclare("kll.notifications.email", durable: true, exclusive: false, autoDelete: false, arguments: dlqArgs);
        _channel.QueueDeclare("kll.notifications.sms", durable: true, exclusive: false, autoDelete: false, arguments: dlqArgs);
        _channel.QueueDeclare("kll.notifications.push", durable: true, exclusive: false, autoDelete: false, arguments: dlqArgs);
        _channel.QueueDeclare("kll.receipts.generate", durable: true, exclusive: false, autoDelete: false, arguments: dlqArgs);
        _channel.QueueDeclare("kll.dlq", durable: true, exclusive: false, autoDelete: false);

        _logger.LogInformation("RabbitMQ connected and queues declared");
    }

    public Task PublishAsync(string queue, object message, byte priority = 0, CancellationToken ct = default)
    {
        var json = JsonSerializer.Serialize(message, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        var body = Encoding.UTF8.GetBytes(json);

        var props = _channel.CreateBasicProperties();
        props.Persistent = true;
        props.Priority = priority;
        props.MessageId = Guid.NewGuid().ToString();
        props.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

        _channel.BasicPublish("", queue, props, body);
        _logger.LogInformation("Published to {Queue} priority={Priority}", queue, priority);
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
    }
}