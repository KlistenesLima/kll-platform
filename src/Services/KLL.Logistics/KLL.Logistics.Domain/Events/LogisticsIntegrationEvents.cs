using KLL.BuildingBlocks.Domain.Events;

namespace KLL.Logistics.Domain.Events;

public class ShipmentCreatedIntegrationEvent : IntegrationEvent
{
    public Guid ShipmentId { get; set; }
    public Guid OrderId { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
}

public class ShipmentDeliveredIntegrationEvent : IntegrationEvent
{
    public Guid ShipmentId { get; set; }
    public Guid OrderId { get; set; }
    public string TrackingCode { get; set; } = string.Empty;
}
