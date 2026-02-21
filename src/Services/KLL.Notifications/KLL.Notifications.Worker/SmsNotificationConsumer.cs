using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace KLL.Notifications.Worker;

public class SmsNotificationConsumer : BackgroundService
{
    private readonly ILogger<SmsNotificationConsumer> _logger;
    private readonly IConfiguration _config;

    public SmsNotificationConsumer(ILogger<SmsNotificationConsumer> logger, IConfiguration config)
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
                channel.BasicQos(0, 10, false);

                var consumer = new EventingBasicConsumer(channel);
                consumer.Received += (_, ea) =>
                {
                    var body = Encoding.UTF8.GetString(ea.Body.ToArray());
                    var sms = JsonSerializer.Deserialize<SmsNotification>(body);
                    _logger.LogInformation("SMS sent to {Phone}: {Message}", sms?.Phone, sms?.Message);
                    channel.BasicAck(ea.DeliveryTag, false);
                };

                channel.BasicConsume("notification.sms", false, consumer);
                _logger.LogInformation("SmsNotificationConsumer listening");
                await Task.Delay(Timeout.Infinite, ct);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex) { _logger.LogError(ex, "SMS consumer error"); await Task.Delay(5000, ct); }
        }
    }
}
