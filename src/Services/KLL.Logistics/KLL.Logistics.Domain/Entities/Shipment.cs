using KLL.BuildingBlocks.Domain.Entities;
using KLL.Logistics.Domain.Events;

namespace KLL.Logistics.Domain.Entities;

public class Shipment : BaseEntity
{
    public Guid OrderId { get; private set; }
    public string RecipientName { get; private set; } = string.Empty;
    public string RecipientEmail { get; private set; } = string.Empty;
    public string TrackingCode { get; private set; } = string.Empty;
    public ShipmentStatus Status { get; private set; } = ShipmentStatus.Created;
    public string DestinationAddress { get; private set; } = string.Empty;
    public string DestinationCity { get; private set; } = string.Empty;
    public string DestinationState { get; private set; } = string.Empty;
    public string DestinationZipCode { get; private set; } = string.Empty;
    public decimal Weight { get; private set; }
    public Guid? DriverId { get; private set; }
    public DateTime? EstimatedDelivery { get; private set; }
    public DateTime? DeliveredAt { get; private set; }

    private readonly List<TrackingEvent> _trackingEvents = new();
    public IReadOnlyCollection<TrackingEvent> TrackingEvents => _trackingEvents.AsReadOnly();

    private Shipment() { }

    public static Shipment Create(Guid orderId, string recipientName, string recipientEmail,
        string address, string city, string state, string zipCode, decimal weight)
    {
        var shipment = new Shipment
        {
            OrderId = orderId, RecipientName = recipientName, RecipientEmail = recipientEmail,
            DestinationAddress = address, DestinationCity = city, DestinationState = state,
            DestinationZipCode = zipCode, Weight = weight,
            TrackingCode = $"KLL{DateTime.UtcNow:yyyyMMdd}{Guid.NewGuid().ToString()[..8].ToUpper()}",
            EstimatedDelivery = DateTime.UtcNow.AddDays(5)
        };
        shipment.AddTrackingEvent("Shipment created", "Distribution Center");
        shipment.AddDomainEvent(new ShipmentCreatedEvent(shipment.Id, orderId, shipment.TrackingCode));
        return shipment;
    }

    public void AssignDriver(Guid driverId)
    {
        DriverId = driverId;
        Status = ShipmentStatus.InTransit;
        SetUpdated();
        AddTrackingEvent("Package picked up by driver", "Distribution Center");
    }

    public void UpdateLocation(string description, string location)
    {
        AddTrackingEvent(description, location);
        SetUpdated();
    }

    public void UpdateStatus(ShipmentStatus newStatus, string description, string? location)
    {
        Status = newStatus;
        if (newStatus == ShipmentStatus.Delivered)
            DeliveredAt = DateTime.UtcNow;
        SetUpdated();
        AddTrackingEvent(description, location ?? DestinationCity);
        if (newStatus == ShipmentStatus.Delivered)
            AddDomainEvent(new ShipmentDeliveredEvent(Id, OrderId, TrackingCode));
    }

    public void MarkDelivered()
    {
        Status = ShipmentStatus.Delivered;
        DeliveredAt = DateTime.UtcNow;
        SetUpdated();
        AddTrackingEvent("Package delivered", DestinationCity);
        AddDomainEvent(new ShipmentDeliveredEvent(Id, OrderId, TrackingCode));
    }

    private void AddTrackingEvent(string desc, string location)
    {
        _trackingEvents.Add(new TrackingEvent(desc, location));
    }
}

public class TrackingEvent
{
    public Guid Id { get; private set; }
    public string Description { get; private set; }
    public string Location { get; private set; }
    public DateTime Timestamp { get; private set; } = DateTime.UtcNow;
    public TrackingEvent(string description, string location) { Description = description; Location = location; }
    private TrackingEvent() { Description = string.Empty; Location = string.Empty; }
}

public enum ShipmentStatus { Created, Processing, InTransit, OutForDelivery, Delivered, Returned }
