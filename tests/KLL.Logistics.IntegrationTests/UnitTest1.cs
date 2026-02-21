using FluentAssertions;
using KLL.Logistics.Domain.Entities;
using Xunit;

namespace KLL.Logistics.IntegrationTests;

public class ShipmentLifecycleTests
{
    [Fact]
    public void FullLifecycle_CreateToDelivery_ShouldTransitionCorrectly()
    {
        var orderId = Guid.NewGuid();
        var shipment = Shipment.Create(orderId, "Ana Costa", "ana@email.com",
            "Av Boa Viagem 1000", "Recife", "PE", "51000-000", 2.0m);

        shipment.Status.Should().Be(ShipmentStatus.Created);
        shipment.TrackingEvents.Should().HaveCount(1);

        var driverId = Guid.NewGuid();
        shipment.AssignDriver(driverId);
        shipment.Status.Should().Be(ShipmentStatus.InTransit);
        shipment.TrackingEvents.Should().HaveCount(2);

        shipment.UpdateLocation("Saiu do centro de distribuicao", "Jaboatao, PE");
        shipment.TrackingEvents.Should().HaveCount(3);

        shipment.UpdateLocation("Em rota de entrega", "Recife, PE");
        shipment.TrackingEvents.Should().HaveCount(4);

        shipment.MarkDelivered();
        shipment.Status.Should().Be(ShipmentStatus.Delivered);
        shipment.DeliveredAt.Should().NotBeNull();
        shipment.TrackingEvents.Should().HaveCount(5);
    }

    [Fact]
    public void MultipleShipments_ShouldHaveUniqueTrackingCodes()
    {
        var codes = new HashSet<string>();
        for (int i = 0; i < 10; i++)
        {
            var s = Shipment.Create(Guid.NewGuid(), $"User {i}", $"u{i}@e.com",
                "Addr", "City", "ST", "00000-000", 1m);
            codes.Add(s.TrackingCode);
        }

        codes.Should().HaveCount(10);
    }
}
