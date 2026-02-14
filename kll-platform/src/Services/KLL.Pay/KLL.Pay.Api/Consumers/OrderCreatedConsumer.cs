using System.Text.Json;
using Confluent.Kafka;
using KLL.Pay.Application.DTOs.Requests;
using KLL.Pay.Application.Services;
using KLL.Pay.Domain.Interfaces;

namespace KLL.Pay.Api.Consumers;

public class OrderCreatedConsumer : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<OrderCreatedConsumer> _logger;
    private readonly IConfiguration _config;

    public OrderCreatedConsumer(IServiceProvider sp, ILogger<OrderCreatedConsumer> logger, IConfiguration config)
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
        consumer.Subscribe("ordercreated");

        _logger.LogInformation("OrderCreatedConsumer started, listening on 'ordercreated'");

        while (!ct.IsCancellationRequested)
        {
            try
            {
                var result = consumer.Consume(ct);
                var evt = JsonSerializer.Deserialize<OrderCreatedData>(result.Message.Value,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (evt != null)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var merchantRepo = scope.ServiceProvider.GetRequiredService<IMerchantRepository>();

                    // Get default platform merchant (KLL Store itself)
                    var merchants = await merchantRepo.GetAllAsync(ct);
                    var merchant = merchants.FirstOrDefault();

                    if (merchant != null)
                    {
                        var txService = scope.ServiceProvider.GetRequiredService<TransactionService>();
                        await txService.CreateChargeAsync(new CreateChargeRequest(
                            merchant.ApiKey, evt.TotalAmount, "Pix",
                            $"Order {evt.OrderId}", null, evt.OrderId
                        ), ct);
                        _logger.LogInformation("Created PIX charge for order {OrderId}, amount {Amount}", evt.OrderId, evt.TotalAmount);
                    }
                    consumer.Commit(result);
                }
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error consuming OrderCreated event");
                await Task.Delay(1000, ct);
            }
        }
    }

    private record OrderCreatedData(Guid OrderId, string CustomerId, string CustomerEmail, decimal TotalAmount);
}