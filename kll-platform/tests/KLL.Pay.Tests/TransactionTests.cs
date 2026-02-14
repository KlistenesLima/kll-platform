using FluentAssertions;
using KLL.Pay.Domain.Entities;
using Xunit;

namespace KLL.Pay.Tests;

public class TransactionTests
{
    [Fact]
    public void CreateCharge_Pix_ShouldGenerateQrCode()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 150.00m, TransactionType.Pix, "Test charge", "12345678901");

        tx.Status.Should().Be(TransactionStatus.Pending);
        tx.Amount.Should().Be(150.00m);
        tx.PixQrCode.Should().NotBeNullOrEmpty();
        tx.DomainEvents.Should().HaveCount(1);
    }

    [Fact]
    public void ConfirmPayment_ShouldTransitionToConfirmed()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 100m, TransactionType.Pix, "Test", null);
        tx.ClearDomainEvents();

        tx.ConfirmPayment("bank-charge-123");

        tx.Status.Should().Be(TransactionStatus.Confirmed);
        tx.BankChargeId.Should().Be("bank-charge-123");
        tx.DomainEvents.Should().HaveCount(1);
    }

    [Fact]
    public void Fail_ShouldSetReason()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 100m, TransactionType.CreditCard, "Test", null);

        tx.Fail("Insufficient funds");

        tx.Status.Should().Be(TransactionStatus.Failed);
    }
}