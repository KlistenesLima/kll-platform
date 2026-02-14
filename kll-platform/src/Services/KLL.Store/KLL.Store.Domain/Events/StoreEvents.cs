using KLL.BuildingBlocks.Domain.Events;

namespace KLL.Store.Domain.Events;

public record ProductCreatedEvent(Guid ProductId, string Name, decimal Price) : DomainEvent;
public record ProductStockDeductedEvent(Guid ProductId, int QuantityDeducted, int RemainingStock) : DomainEvent;
public record OrderPaidEvent(Guid OrderId, string CustomerId, decimal Amount, string ChargeId) : DomainEvent;
public record OrderShippedEvent(Guid OrderId, string TrackingCode) : DomainEvent;
public record OrderCancelledEvent(Guid OrderId, string CustomerId, decimal Amount) : DomainEvent;