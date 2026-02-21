using KLL.BuildingBlocks.Domain.Events;

namespace KLL.Pay.Domain.Events;

public record TransactionCreatedEvent(Guid TransactionId, Guid MerchantId, decimal Amount, string Type) : DomainEvent;
public record TransactionConfirmedEvent(Guid TransactionId, Guid MerchantId, decimal Amount, string BankChargeId) : DomainEvent;
