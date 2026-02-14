using System.Text.Json;
using Confluent.Kafka;
using KLL.Store.Domain.Events;
using KLL.Store.Application.Interfaces;

namespace KLL.Store.Api.Consumers;

public class PaymentConfirmedConsumer : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<PaymentConfirmedConsumer> _logger;
    private readonly IConfiguration _config;

    public PaymentConfirmedConsumer(IServiceProvider sp, ILogger<PaymentConfirmedConsumer> logger, IConfiguration config)
    { _serviceProvider = sp; _logger = logger; _config = config; }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var consumerConfig = new ConsumerConfig
        {
            BootstrapServers = _config["Kafka:BootstrapServers"] ?? "localhost:39092",
            GroupId = _config["Kafka:GroupId"] ?? "kll-store-group",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false
        };

        using var consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
        consumer.Subscribe("paymentconfirmed");

        _logger.LogInformation("PaymentConfirmedConsumer started, listening on 'paymentconfirmed'");

        while (!ct.IsCancellationRequested)
        {
            try
            {
                var result = consumer.Consume(ct);
                var evt = JsonSerializer.Deserialize<PaymentConfirmedIntegrationEvent>(result.Message.Value,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (evt != null)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();
                    await orderService.ConfirmPaymentAsync(evt.OrderId, evt.ChargeId, ct);
                    _logger.LogInformation("Order {OrderId} payment confirmed with charge {ChargeId}", evt.OrderId, evt.ChargeId);
                    consumer.Commit(result);
                }
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error consuming PaymentConfirmed event");
                await Task.Delay(1000, ct);
            }
        }
    }
}