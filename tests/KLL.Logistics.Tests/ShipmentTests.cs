using FluentAssertions;
using KLL.Logistics.Domain.Entities;
using Xunit;

namespace KLL.Logistics.Tests;

public class ShipmentTests
{
    [Fact]
    public void Create_ShouldGenerateTrackingCode()
    {
        var shipment = Shipment.Create(Guid.NewGuid(), "João", "joao@email.com",
            "Rua Test 123", "Recife", "PE", "50000-000", 2.5m);

        shipment.TrackingCode.Should().StartWith("KLL");
        shipment.Status.Should().Be(ShipmentStatus.Created);
        shipment.TrackingEvents.Should().HaveCount(1);
        shipment.EstimatedDelivery.Should().NotBeNull();
    }

    [Fact]
    public void AssignDriver_ShouldTransitionToInTransit()
    {
        var shipment = Shipment.Create(Guid.NewGuid(), "Test", "t@t.com", "Addr", "City", "ST", "00000-000", 1m);
        var driverId = Guid.NewGuid();

        shipment.AssignDriver(driverId);

        shipment.Status.Should().Be(ShipmentStatus.InTransit);
        shipment.TrackingEvents.Should().HaveCount(2);
    }

    [Fact]
    public void MarkDelivered_ShouldComplete()
    {
        var shipment = Shipment.Create(Guid.NewGuid(), "Test", "t@t.com", "Addr", "City", "ST", "00000-000", 1m);
        shipment.AssignDriver(Guid.NewGuid());

        shipment.MarkDelivered();

        shipment.Status.Should().Be(ShipmentStatus.Delivered);
        shipment.DeliveredAt.Should().NotBeNull();
        shipment.TrackingEvents.Should().HaveCount(3);
    }
}
