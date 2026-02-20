using FluentAssertions;
using KLL.Logistics.Domain.Entities;
using Xunit;

namespace KLL.Logistics.UnitTests;

public class ShipmentAdditionalTests
{
    private Shipment CreateShipment() =>
        Shipment.Create(Guid.NewGuid(), "Maria Silva", "maria@email.com",
            "Rua das Flores 200", "Sao Paulo", "SP", "01000-000", 3.5m);

    [Fact]
    public void Create_ShouldSetRecipientInfo()
    {
        var orderId = Guid.NewGuid();
        var shipment = Shipment.Create(orderId, "Carlos", "carlos@email.com",
            "Rua B 50", "Rio", "RJ", "20000-000", 1.0m);

        shipment.OrderId.Should().Be(orderId);
        shipment.RecipientName.Should().Be("Carlos");
        shipment.RecipientEmail.Should().Be("carlos@email.com");
        shipment.DestinationCity.Should().Be("Rio");
        shipment.DestinationState.Should().Be("RJ");
        shipment.DestinationZipCode.Should().Be("20000-000");
        shipment.Weight.Should().Be(1.0m);
    }

    [Fact]
    public void Create_TrackingCodeShouldBeUnique()
    {
        var s1 = CreateShipment();
        var s2 = CreateShipment();

        s1.TrackingCode.Should().NotBe(s2.TrackingCode);
    }

    [Fact]
    public void Create_ShouldSetEstimatedDeliveryInFuture()
    {
        var shipment = CreateShipment();

        shipment.EstimatedDelivery.Should().BeAfter(DateTime.UtcNow);
    }

    [Fact]
    public void Create_ShouldHaveCreatedStatus()
    {
        var shipment = CreateShipment();

        shipment.Status.Should().Be(ShipmentStatus.Created);
        shipment.DeliveredAt.Should().BeNull();
        shipment.DriverId.Should().BeNull();
    }

    [Fact]
    public void AssignDriver_ShouldSetDriverIdAndTransitStatus()
    {
        var shipment = CreateShipment();
        var driverId = Guid.NewGuid();

        shipment.AssignDriver(driverId);

        shipment.DriverId.Should().Be(driverId);
        shipment.Status.Should().Be(ShipmentStatus.InTransit);
    }

    [Fact]
    public void AssignDriver_ShouldAddTrackingEvent()
    {
        var shipment = CreateShipment();
        var initialEvents = shipment.TrackingEvents.Count;

        shipment.AssignDriver(Guid.NewGuid());

        shipment.TrackingEvents.Should().HaveCount(initialEvents + 1);
    }

    [Fact]
    public void UpdateLocation_ShouldAddEventWithLocationInfo()
    {
        var shipment = CreateShipment();

        shipment.UpdateLocation("Em transito", "Centro de Distribuicao SP");

        var lastEvent = shipment.TrackingEvents.Last();
        lastEvent.Description.Should().Be("Em transito");
        lastEvent.Location.Should().Be("Centro de Distribuicao SP");
    }

    [Fact]
    public void UpdateLocation_MultipleTimes_ShouldAddMultipleEvents()
    {
        var shipment = CreateShipment();
        var initial = shipment.TrackingEvents.Count;

        shipment.UpdateLocation("Saiu para entrega", "Local A");
        shipment.UpdateLocation("Em rota", "Local B");
        shipment.UpdateLocation("Proximo ao destino", "Local C");

        shipment.TrackingEvents.Should().HaveCount(initial + 3);
    }

    [Fact]
    public void MarkDelivered_ShouldSetDeliveredAtAndStatus()
    {
        var shipment = CreateShipment();
        shipment.AssignDriver(Guid.NewGuid());

        var before = DateTime.UtcNow;
        shipment.MarkDelivered();

        shipment.Status.Should().Be(ShipmentStatus.Delivered);
        shipment.DeliveredAt.Should().NotBeNull();
        shipment.DeliveredAt.Should().BeOnOrAfter(before);
    }

    [Fact]
    public void MarkDelivered_ShouldRaiseDomainEvent()
    {
        var shipment = CreateShipment();
        shipment.AssignDriver(Guid.NewGuid());

        shipment.MarkDelivered();

        shipment.DomainEvents.Should().Contain(e => e.GetType().Name == "ShipmentDeliveredEvent");
    }

    [Fact]
    public void TrackingCode_ShouldStartWithKLL()
    {
        var shipment = CreateShipment();

        shipment.TrackingCode.Should().StartWith("KLL");
    }

    [Fact]
    public void Create_InitialTrackingEvent_ShouldBeCreated()
    {
        var shipment = CreateShipment();

        shipment.TrackingEvents.Should().HaveCount(1);
        shipment.TrackingEvents.First().Description.Should().Be("Shipment created");
    }
}
