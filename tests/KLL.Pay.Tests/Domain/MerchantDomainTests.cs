using FluentAssertions;
using KLL.Pay.Domain.Entities;
using Xunit;

namespace KLL.Pay.Tests.Domain;

public class MerchantDomainTests
{
    [Fact]
    public void Create_ShouldGenerateApiKey()
    {
        var merchant = Merchant.Create("Loja KLL", "12345678000199", "loja@kll.com", null);

        merchant.Name.Should().Be("Loja KLL");
        merchant.ApiKey.Should().StartWith("kll_pk_");
        merchant.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Update_ShouldChangeFields()
    {
        var merchant = Merchant.Create("Old Name", "12345678000199", "old@email.com", null);

        merchant.Update("New Name", "new@email.com", "https://webhook.example.com");

        merchant.Name.Should().Be("New Name");
        merchant.Email.Should().Be("new@email.com");
        merchant.WebhookUrl.Should().Be("https://webhook.example.com");
        merchant.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Deactivate_ShouldSetInactive()
    {
        var merchant = Merchant.Create("Test", "11222333000100", "t@t.com", null);
        merchant.Deactivate();
        merchant.IsActive.Should().BeFalse();
    }
}
