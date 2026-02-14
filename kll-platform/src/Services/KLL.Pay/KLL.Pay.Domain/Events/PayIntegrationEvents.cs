using KLL.BuildingBlocks.Domain.Events;

namespace KLL.Pay.Domain.Events;

public class PaymentRequestedToKrtBankEvent : IntegrationEvent
{
    public Guid TransactionId { get; set; }
    public Guid MerchantId { get; set; }
    public decimal Amount { get; set; }
    public string PaymentType { get; set; } = string.Empty;
    public string? PayerDocument { get; set; }
    public string? Description { get; set; }
}

public class PaymentConfirmedByKrtBankEvent : IntegrationEvent
{
    public Guid TransactionId { get; set; }
    public string BankChargeId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}