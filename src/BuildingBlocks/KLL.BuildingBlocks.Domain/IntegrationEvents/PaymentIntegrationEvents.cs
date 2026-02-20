using KLL.BuildingBlocks.Domain.Events;

namespace KLL.BuildingBlocks.Domain.IntegrationEvents;

/// <summary>
/// Shared integration events for cross-service communication.
/// Placed in BuildingBlocks to avoid circular dependencies between services.
/// </summary>

public class PaymentConfirmedIntegrationEvent : IntegrationEvent
{
    public Guid OrderId { get; set; }
    public string ChargeId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
