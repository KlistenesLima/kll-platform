using KLL.BuildingBlocks.Domain.Events;

namespace KLL.Logistics.Domain.Events;

public record ShipmentCreatedEvent(Guid ShipmentId, Guid OrderId, string TrackingCode) : DomainEvent;
public record ShipmentDeliveredEvent(Guid ShipmentId, Guid OrderId, string TrackingCode) : DomainEvent;
