using KLL.BuildingBlocks.Domain.Entities;
using KLL.Pay.Domain.Events;

namespace KLL.Pay.Domain.Entities;

public class Transaction : BaseEntity
{
    public Guid MerchantId { get; private set; }
    public Guid? ExternalOrderId { get; private set; }
    public decimal Amount { get; private set; }
    public string Currency { get; private set; } = "BRL";
    public TransactionStatus Status { get; private set; } = TransactionStatus.Pending;
    public TransactionType Type { get; private set; }
    public string? PixQrCode { get; private set; }
    public string? Description { get; private set; }
    public string? PayerDocument { get; private set; }
    public string? BankChargeId { get; private set; }

    private Transaction() { }

    public static Transaction CreateCharge(Guid merchantId, decimal amount, TransactionType type,
        string? description, string? payerDocument, Guid? externalOrderId = null)
    {
        var tx = new Transaction
        {
            MerchantId = merchantId, Amount = amount, Type = type,
            Description = description, PayerDocument = payerDocument,
            ExternalOrderId = externalOrderId
        };
        if (type == TransactionType.Pix)
            tx.PixQrCode = $"00020126580014br.gov.bcb.pix0136{tx.Id}5204000053039865406{amount:F2}5802BR";
        tx.AddDomainEvent(new TransactionCreatedEvent(tx.Id, merchantId, amount, type.ToString()));
        return tx;
    }

    public void ConfirmPayment(string bankChargeId)
    {
        BankChargeId = bankChargeId;
        Status = TransactionStatus.Confirmed;
        SetUpdated();
        AddDomainEvent(new TransactionConfirmedEvent(Id, MerchantId, Amount, bankChargeId));
    }

    public void Fail(string reason)
    {
        Status = TransactionStatus.Failed;
        Description = reason;
        SetUpdated();
    }

    public void Refund()
    {
        Status = TransactionStatus.Refunded;
        SetUpdated();
    }
}

public enum TransactionStatus { Pending, Confirmed, Failed, Refunded, Expired }
public enum TransactionType { Pix, Boleto, CreditCard }
