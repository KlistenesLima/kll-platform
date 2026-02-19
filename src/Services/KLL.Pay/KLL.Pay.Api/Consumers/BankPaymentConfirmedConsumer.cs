using System.Text.Json;
using Confluent.Kafka;
using KLL.BuildingBlocks.Domain.IntegrationEvents;
using KLL.BuildingBlocks.EventBus.Interfaces;
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
        await Task.Delay(5000, ct); // wait for Kafka to be ready

        var consumerConfig = new ConsumerConfig
        {
            BootstrapServers = _config["Kafka:BootstrapServers"] ?? "localhost:39092",
            GroupId = _config["Kafka:GroupId"] ?? "kll-pay-group",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false
        };

        using var consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
        consumer.Subscribe("bankpaymentconfirmed");

        _logger.LogInformation("BankPaymentConfirmedConsumer started");

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

                    var eventBus = scope.ServiceProvider.GetRequiredService<IEventBus>();
                    await eventBus.PublishAsync(new PaymentConfirmedIntegrationEvent
                    {
                        OrderId = data.OrderId,
                        ChargeId = data.BankChargeId,
                        Amount = data.Amount
                    }, ct);

                    _logger.LogInformation("Bank payment confirmed for tx {TxId}", data.TransactionId);
                    consumer.Commit(result);
                }
            }
            catch (OperationCanceledException) { break; }
            catch (ConsumeException ex) when (ex.Error.Code == ErrorCode.UnknownTopicOrPart)
            {
                _logger.LogWarning("Topic 'bankpaymentconfirmed' not available yet, retrying in 10s...");
                await Task.Delay(10000, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error consuming BankPaymentConfirmed event");
                await Task.Delay(3000, ct);
            }
        }
    }

    private record BankConfirmData(Guid TransactionId, Guid OrderId, string BankChargeId, decimal Amount);
}
