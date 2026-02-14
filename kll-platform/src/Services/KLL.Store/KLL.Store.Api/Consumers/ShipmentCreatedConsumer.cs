using System.Text.Json;
using Confluent.Kafka;
using KLL.Store.Domain.Interfaces;

namespace KLL.Store.Api.Consumers;

public class ShipmentCreatedConsumer : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ShipmentCreatedConsumer> _logger;
    private readonly IConfiguration _config;

    public ShipmentCreatedConsumer(IServiceProvider sp, ILogger<ShipmentCreatedConsumer> logger, IConfiguration config)
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
        consumer.Subscribe("shipmentcreated");

        _logger.LogInformation("ShipmentCreatedConsumer started, listening on 'shipmentcreated'");

        while (!ct.IsCancellationRequested)
        {
            try
            {
                var result = consumer.Consume(ct);
                var data = JsonSerializer.Deserialize<ShipmentCreatedData>(result.Message.Value,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (data != null)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var orderRepo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
                    var order = await orderRepo.GetByIdAsync(data.OrderId, ct);
                    if (order != null)
                    {
                        order.SetShipped(data.TrackingCode);
                        await orderRepo.UpdateAsync(order, ct);
                        await orderRepo.SaveChangesAsync(ct);
                        _logger.LogInformation("Order {OrderId} shipped with tracking {Code}", data.OrderId, data.TrackingCode);
                    }
                    consumer.Commit(result);
                }
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error consuming ShipmentCreated event");
                await Task.Delay(1000, ct);
            }
        }
    }

    private record ShipmentCreatedData(Guid ShipmentId, Guid OrderId, string TrackingCode);
}