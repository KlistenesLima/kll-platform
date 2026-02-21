using FluentAssertions;
using KLL.Pay.Domain.Entities;
using Xunit;

namespace KLL.Pay.UnitTests;

public class TransactionAdditionalTests
{
    [Fact]
    public void CreateCharge_Pix_ShouldGenerateQrCode()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 250m, TransactionType.Pix, "PIX payment", "11122233344");

        tx.PixQrCode.Should().NotBeNullOrEmpty();
        tx.Type.Should().Be(TransactionType.Pix);
        tx.Amount.Should().Be(250m);
        tx.Currency.Should().Be("BRL");
    }

    [Fact]
    public void CreateCharge_ShouldSetDescription()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 100m, TransactionType.Pix, "Order #123 payment", null);

        tx.Description.Should().Be("Order #123 payment");
    }

    [Fact]
    public void CreateCharge_WithOrderId_ShouldSetExternalOrderId()
    {
        var merchantId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        var tx = Transaction.CreateCharge(merchantId, 500m, TransactionType.Pix, "Test", null, orderId);

        tx.MerchantId.Should().Be(merchantId);
        tx.ExternalOrderId.Should().Be(orderId);
    }

    [Fact]
    public void CreateCharge_ShouldBeInPendingStatus()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 99.99m, TransactionType.CreditCard, "CC test", null);

        tx.Status.Should().Be(TransactionStatus.Pending);
    }

    [Fact]
    public void CreateCharge_ShouldRaiseDomainEvent()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 100m, TransactionType.Pix, "Test", null);

        tx.DomainEvents.Should().HaveCount(1);
    }

    [Fact]
    public void ConfirmPayment_ShouldSetBankChargeId()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 100m, TransactionType.Pix, "Test", null);
        tx.ClearDomainEvents();

        tx.ConfirmPayment("krt-bank-charge-xyz");

        tx.BankChargeId.Should().Be("krt-bank-charge-xyz");
        tx.Status.Should().Be(TransactionStatus.Confirmed);
    }

    [Fact]
    public void Fail_ShouldSetFailedStatus()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 100m, TransactionType.CreditCard, "Test", null);

        tx.Fail("Card declined");

        tx.Status.Should().Be(TransactionStatus.Failed);
    }

    [Fact]
    public void Refund_AfterConfirm_ShouldSetRefundedStatus()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 100m, TransactionType.Pix, "Test", null);
        tx.ConfirmPayment("bank-1");

        tx.Refund();

        tx.Status.Should().Be(TransactionStatus.Refunded);
    }

    [Fact]
    public void CreateCharge_WithPayerDocument_ShouldSetDocument()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 100m, TransactionType.Pix, "Test", "52998224725");

        tx.PayerDocument.Should().Be("52998224725");
    }

    [Fact]
    public void CreateCharge_Boleto_ShouldNotHaveQrCode()
    {
        var tx = Transaction.CreateCharge(Guid.NewGuid(), 100m, TransactionType.Boleto, "Boleto", null);

        tx.PixQrCode.Should().BeNull();
        tx.Type.Should().Be(TransactionType.Boleto);
    }
}

public class MerchantAdditionalTests
{
    [Fact]
    public void Create_ShouldGenerateApiKeyWithPrefix()
    {
        var merchant = Merchant.Create("Test Store", "12345678000199", "store@test.com", null);

        merchant.ApiKey.Should().StartWith("kll_pk_");
        merchant.ApiKey.Length.Should().BeGreaterThan(10);
    }

    [Fact]
    public void Create_ShouldBeActiveByDefault()
    {
        var merchant = Merchant.Create("Test", "12345678000199", "t@t.com", null);

        merchant.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Create_WithWebhookUrl_ShouldSetUrl()
    {
        var merchant = Merchant.Create("Test", "12345678000199", "t@t.com", "https://webhook.example.com");

        merchant.WebhookUrl.Should().Be("https://webhook.example.com");
    }

    [Fact]
    public void Update_ShouldSetUpdatedAt()
    {
        var merchant = Merchant.Create("Old", "12345678000199", "old@t.com", null);

        merchant.Update("New", "new@t.com", "https://hook.com");

        merchant.UpdatedAt.Should().NotBeNull();
        merchant.Name.Should().Be("New");
        merchant.Email.Should().Be("new@t.com");
    }

    [Fact]
    public void Create_ShouldSetDocument()
    {
        var merchant = Merchant.Create("Loja", "98765432000188", "loja@email.com", null);

        merchant.Document.Should().Be("98765432000188");
    }

    [Fact]
    public void Deactivate_ThenIsActiveFalse()
    {
        var merchant = Merchant.Create("Test", "12345678000199", "t@t.com", null);

        merchant.Deactivate();

        merchant.IsActive.Should().BeFalse();
    }

    [Fact]
    public void Create_TwoMerchants_ShouldHaveDifferentApiKeys()
    {
        var m1 = Merchant.Create("Store A", "11111111000111", "a@a.com", null);
        var m2 = Merchant.Create("Store B", "22222222000222", "b@b.com", null);

        m1.ApiKey.Should().NotBe(m2.ApiKey);
    }
}
