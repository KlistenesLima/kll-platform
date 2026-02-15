using FluentAssertions;
using KLL.Pay.Domain.Entities;
using Xunit;

namespace KLL.Pay.Tests.Domain;

public class TransactionDomainTests
{
    [Fact]
    public void CreateCharge_Boleto_ShouldNotGenerateQrCode()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 200m, TransactionType.Boleto, "Boleto test", "12345678901");
        tx.PixQrCode.Should().BeNull();
        tx.Type.Should().Be(TransactionType.Boleto);
    }

    [Fact]
    public void CreateCharge_CreditCard_ShouldNotGenerateQrCode()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 300m, TransactionType.CreditCard, "CC test", null);
        tx.PixQrCode.Should().BeNull();
    }

    [Fact]
    public void Refund_ShouldSetStatus()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 100m, TransactionType.Pix, "Test", null);
        tx.ConfirmPayment("bank-1");
        tx.Refund();
        tx.Status.Should().Be(TransactionStatus.Refunded);
    }

    [Fact]
    public void FullLifecycle_Pix_ShouldWork()
    {
        var merchantId = Guid.NewGuid();
        var orderId = Guid.NewGuid();

        var tx = Transaction.CreateCharge(merchantId, 150m, TransactionType.Pix, "Order payment", "11122233344", orderId);

        tx.Status.Should().Be(TransactionStatus.Pending);
        tx.PixQrCode.Should().NotBeNullOrEmpty();
        tx.ExternalOrderId.Should().Be(orderId);
        tx.DomainEvents.Should().HaveCount(1);

        tx.ClearDomainEvents();
        tx.ConfirmPayment("bank-charge-abc");

        tx.Status.Should().Be(TransactionStatus.Confirmed);
        tx.BankChargeId.Should().Be("bank-charge-abc");
        tx.DomainEvents.Should().HaveCount(1);
    }
}
