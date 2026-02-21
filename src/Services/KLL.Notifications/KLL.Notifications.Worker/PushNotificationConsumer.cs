using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace KLL.Notifications.Worker;

public class PushNotificationConsumer : BackgroundService
{
    private readonly ILogger<PushNotificationConsumer> _logger;
    private readonly IConfiguration _config;

    public PushNotificationConsumer(ILogger<PushNotificationConsumer> logger, IConfiguration config)
    {
        _logger = logger;
        _config = config;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var factory = new ConnectionFactory
        {
            HostName = _config["RabbitMQ:Host"] ?? "localhost",
            Port = int.Parse(_config["RabbitMQ:Port"] ?? "5672"),
            UserName = _config["RabbitMQ:User"] ?? "guest",
            Password = _config["RabbitMQ:Password"] ?? ""
        };

        while (!ct.IsCancellationRequested)
        {
            try
            {
                using var connection = factory.CreateConnection();
                using var channel = connection.CreateModel();

                var consumer = new EventingBasicConsumer(channel);
                consumer.Received += (_, ea) =>
                {
                    var body = Encoding.UTF8.GetString(ea.Body.ToArray());
                    var push = JsonSerializer.Deserialize<PushNotification>(body);
                    _logger.LogInformation("PUSH to {UserId}: {Title}", push?.UserId, push?.Title);
                    channel.BasicAck(ea.DeliveryTag, false);
                };

                channel.BasicConsume("notification.push", false, consumer);
                _logger.LogInformation("PushNotificationConsumer listening");
                await Task.Delay(Timeout.Infinite, ct);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex) { _logger.LogError(ex, "Push consumer error"); await Task.Delay(5000, ct); }
        }
    }
}
