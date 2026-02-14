using System.Text.Json;
using Confluent.Kafka;
using KLL.Logistics.Application.DTOs.Requests;
using KLL.Logistics.Application.Services;

namespace KLL.Logistics.Api.Consumers;

public class ShipmentRequestedConsumer : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ShipmentRequestedConsumer> _logger;
    private readonly IConfiguration _config;

    public ShipmentRequestedConsumer(IServiceProvider sp, ILogger<ShipmentRequestedConsumer> logger, IConfiguration config)
    { _serviceProvider = sp; _logger = logger; _config = config; }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var consumerConfig = new ConsumerConfig
        {
            BootstrapServers = _config["Kafka:BootstrapServers"] ?? "localhost:39092",
            GroupId = _config["Kafka:GroupId"] ?? "kll-logistics-group",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = false
        };

        using var consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
        consumer.Subscribe("shipmentrequested");

        _logger.LogInformation("ShipmentRequestedConsumer started, listening on 'shipmentrequested'");

        while (!ct.IsCancellationRequested)
        {
            try
            {
                var result = consumer.Consume(ct);
                var data = JsonSerializer.Deserialize<ShipmentRequestData>(result.Message.Value,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (data != null)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var shipmentService = scope.ServiceProvider.GetRequiredService<ShipmentService>();
                    var shipment = await shipmentService.CreateAsync(new CreateShipmentRequest(
                        data.OrderId, data.RecipientName, data.RecipientEmail,
                        $"{data.Street}, {data.Number}", data.City, data.State, data.ZipCode, data.Weight
                    ), ct);
                    _logger.LogInformation("Shipment {TrackingCode} created for order {OrderId}", shipment.TrackingCode, data.OrderId);
                    consumer.Commit(result);
                }
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error consuming ShipmentRequested event");
                await Task.Delay(1000, ct);
            }
        }
    }

    private record ShipmentRequestData(Guid OrderId, string RecipientName, string RecipientEmail,
        string Street, string Number, string City, string State, string ZipCode, decimal Weight);
}