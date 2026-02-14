using System.Text.Json;
using Confluent.Kafka;
using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.Store.Domain.Events;
using KLL.Pay.Application.Services;

namespace KLL.Pay.Api.Consumers;

public class BankPaymentConfirmedConsumer : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BankPaymentConfirmedConsumer> _logger;
    private readonly IConfiguration _config;

    public BankPaymentConfirmedConsumer(IServiceProvider sp, ILogger<BankPaymentConfirmedConsumer> logger, IConfiguration config)
    { _serviceProvider = sp; _logger = logger; _config = config; }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var consumerConfig = new ConsumerConfig
        {
            BootstrapServers = _config["Kafka:BootstrapServers"] ?? "localhost:39092",
            GroupId = _config["Kafka:GroupId"] ?? "kll-pay-group",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false
        };

        using var consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
        consumer.Subscribe("bankpaymentconfirmed");

        _logger.LogInformation("BankPaymentConfirmedConsumer started, listening on 'bankpaymentconfirmed'");

        while (!ct.IsCancellationRequested)
        {
            try
            {
                var result = consumer.Consume(ct);
                var data = JsonSerializer.Deserialize<BankConfirmData>(result.Message.Value,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (data != null)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var txService = scope.ServiceProvider.GetRequiredService<TransactionService>();
                    await txService.ConfirmFromBankAsync(data.TransactionId, data.BankChargeId, ct);

                    // Propagate to Store service
                    var eventBus = scope.ServiceProvider.GetRequiredService<IEventBus>();
                    await eventBus.PublishAsync(new PaymentConfirmedIntegrationEvent
                    {
                        OrderId = data.OrderId,
                        ChargeId = data.BankChargeId,
                        Amount = data.Amount
                    }, ct);

                    _logger.LogInformation("Bank payment confirmed for tx {TxId}, propagated to Store", data.TransactionId);
                    consumer.Commit(result);
                }
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error consuming BankPaymentConfirmed event");
                await Task.Delay(1000, ct);
            }
        }
    }

    private record BankConfirmData(Guid TransactionId, Guid OrderId, string BankChargeId, decimal Amount);
}