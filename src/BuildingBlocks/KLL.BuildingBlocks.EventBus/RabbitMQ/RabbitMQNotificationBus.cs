using System.Text;
using KLL.BuildingBlocks.EventBus.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RabbitMQ.Client;

namespace KLL.BuildingBlocks.EventBus.RabbitMQ;

public class RabbitMQNotificationBus : INotificationBus, IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly ILogger<RabbitMQNotificationBus> _logger;

    public RabbitMQNotificationBus(IConfiguration config, ILogger<RabbitMQNotificationBus> logger)
    {
        _logger = logger;
        var factory = new ConnectionFactory
        {
            HostName = config["RabbitMQ:Host"] ?? "localhost",
            Port = int.Parse(config["RabbitMQ:Port"] ?? "5673"),
            UserName = config["RabbitMQ:User"] ?? "kll",
            Password = config["RabbitMQ:Password"] ?? "kll123",
            VirtualHost = config["RabbitMQ:VHost"] ?? "/",
            AutomaticRecoveryEnabled = true,
            NetworkRecoveryInterval = TimeSpan.FromSeconds(10)
        };
        _connection = factory.CreateConnection();
        _channel = _connection.CreateModel();

        // Declare notification queues with DLX
        _channel.ExchangeDeclare("kll.notifications", ExchangeType.Direct, durable: true);
        _channel.ExchangeDeclare("kll.notifications.dlx", ExchangeType.Direct, durable: true);

        foreach (var queue in new[] { "notification.email", "notification.sms", "notification.push" })
        {
            var dlqArgs = new Dictionary<string, object>
            {
                { "x-dead-letter-exchange", "kll.notifications.dlx" },
                { "x-dead-letter-routing-key", $"{queue}.dlq" },
                { "x-message-ttl", 300000 } // 5 min retry
            };
            _channel.QueueDeclare(queue, durable: true, exclusive: false, autoDelete: false, arguments: dlqArgs);
            _channel.QueueBind(queue, "kll.notifications", queue);

            // DLQ
            _channel.QueueDeclare($"{queue}.dlq", durable: true, exclusive: false, autoDelete: false);
            _channel.QueueBind($"{queue}.dlq", "kll.notifications.dlx", $"{queue}.dlq");
        }
    }

    public Task PublishNotificationAsync(string queue, string message, CancellationToken ct = default)
    {
        var body = Encoding.UTF8.GetBytes(message);
        var properties = _channel.CreateBasicProperties();
        properties.Persistent = true;
        properties.MessageId = Guid.NewGuid().ToString();
        properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

        _channel.BasicPublish("kll.notifications", queue, properties, body);
        _logger.LogInformation("Notification published to {Queue}", queue);
        return Task.CompletedTask;
    }

    public void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
    }
}
