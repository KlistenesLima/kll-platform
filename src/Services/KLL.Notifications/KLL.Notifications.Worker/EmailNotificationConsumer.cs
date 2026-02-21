using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace KLL.Notifications.Worker;

public class EmailNotificationConsumer : BackgroundService
{
    private readonly ILogger<EmailNotificationConsumer> _logger;
    private readonly IConfiguration _config;
    private IConnection? _connection;
    private IModel? _channel;

    public EmailNotificationConsumer(ILogger<EmailNotificationConsumer> logger, IConfiguration config)
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
                _connection = factory.CreateConnection();
                _channel = _connection.CreateModel();
                _channel.BasicQos(0, 10, false);

                var consumer = new EventingBasicConsumer(_channel);
                consumer.Received += (_, ea) =>
                {
                    try
                    {
                        var body = Encoding.UTF8.GetString(ea.Body.ToArray());
                        var notification = JsonSerializer.Deserialize<EmailNotification>(body);

                        // In production: send via SMTP / SendGrid / SES
                        _logger.LogInformation("EMAIL sent to {To}: {Subject}", notification?.To, notification?.Subject);

                        _channel.BasicAck(ea.DeliveryTag, false);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to process email notification");
                        _channel.BasicNack(ea.DeliveryTag, false, true);
                    }
                };

                _channel.BasicConsume("notification.email", false, consumer);
                _logger.LogInformation("EmailNotificationConsumer listening on notification.email");

                await Task.Delay(Timeout.Infinite, ct);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "EmailNotificationConsumer connection error, retrying in 5s...");
                await Task.Delay(5000, ct);
            }
        }
    }

    public override void Dispose()
    {
        _channel?.Dispose();
        _connection?.Dispose();
        base.Dispose();
    }
}

public record EmailNotification(string To, string Subject, string Body, string? Template = null);
public record SmsNotification(string Phone, string Message);
public record PushNotification(string UserId, string Title, string Body, string? Action = null);
