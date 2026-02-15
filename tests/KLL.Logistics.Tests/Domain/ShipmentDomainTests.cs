using FluentAssertions;
using KLL.Logistics.Domain.Entities;
using Xunit;

namespace KLL.Logistics.Tests.Domain;

public class ShipmentDomainTests
{
    private Shipment CreateShipment() =>
        Shipment.Create(Guid.NewGuid(), "João Silva", "joao@email.com",
            "Rua das Flores 100", "Recife", "PE", "50000-000", 2.5m);

    [Fact]
    public void Create_ShouldHaveTrackingCodeAndInitialEvent()
    {
        var shipment = CreateShipment();

        shipment.TrackingCode.Should().StartWith("KLL");
        shipment.Status.Should().Be(ShipmentStatus.Created);
        shipment.TrackingEvents.Should().HaveCount(1);
        shipment.TrackingEvents.First().Description.Should().Be("Shipment created");
        shipment.EstimatedDelivery.Should().BeAfter(DateTime.UtcNow);
    }

    [Fact]
    public void FullDeliveryFlow_ShouldTrackAllEvents()
    {
        var shipment = CreateShipment();
        var driverId = Guid.NewGuid();

        // Assign driver
        shipment.AssignDriver(driverId);
        shipment.Status.Should().Be(ShipmentStatus.InTransit);
        shipment.DriverId.Should().Be(driverId);

        // Update location
        shipment.UpdateLocation("Package in transit", "Caruaru, PE");
        shipment.TrackingEvents.Should().HaveCount(3);

        // Deliver
        shipment.MarkDelivered();
        shipment.Status.Should().Be(ShipmentStatus.Delivered);
        shipment.DeliveredAt.Should().NotBeNull();
        shipment.TrackingEvents.Should().HaveCount(4);
        shipment.DomainEvents.Should().Contain(e => e.GetType().Name == "ShipmentDeliveredEvent");
    }

    [Fact]
    public void UpdateLocation_ShouldAddTrackingEvent()
    {
        var shipment = CreateShipment();
        var initialCount = shipment.TrackingEvents.Count;

        shipment.UpdateLocation("Package scanned", "Warehouse B");

        shipment.TrackingEvents.Should().HaveCount(initialCount + 1);
        shipment.TrackingEvents.Last().Description.Should().Be("Package scanned");
        shipment.TrackingEvents.Last().Location.Should().Be("Warehouse B");
    }
}
