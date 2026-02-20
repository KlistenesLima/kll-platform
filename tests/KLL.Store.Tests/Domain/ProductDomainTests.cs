using FluentAssertions;
using KLL.Store.Domain.Entities;
using Xunit;

namespace KLL.Store.Tests.Domain;

public class ProductDomainTests
{
    [Fact]
    public void Create_ShouldRaiseDomainEvent()
    {
        var product = Product.Create("Test", "Desc", 100m, 10, "Cat");
        product.DomainEvents.Should().HaveCount(1);
        product.DomainEvents.First().GetType().Name.Should().Be("ProductCreatedEvent");
    }

    [Fact]
    public void DeductStock_ToZero_ShouldSucceed()
    {
        var product = Product.Create("Test", "Desc", 100m, 5, "Cat");
        product.DeductStock(5);
        product.StockQuantity.Should().Be(0);
    }

    [Fact]
    public void RestoreStock_ShouldAddBack()
    {
        var product = Product.Create("Test", "Desc", 100m, 3, "Cat");
        product.DeductStock(3);
        product.RestoreStock(3);
        product.StockQuantity.Should().Be(3);
    }

    [Fact]
    public void Deactivate_ShouldSetInactive()
    {
        var product = Product.Create("Test", "Desc", 100m, 10, "Cat");
        product.Deactivate();
        product.IsActive.Should().BeFalse();
    }

    [Fact]
    public void Activate_ShouldSetActive()
    {
        var product = Product.Create("Test", "Desc", 100m, 10, "Cat");
        product.Deactivate();
        product.Activate();
        product.IsActive.Should().BeTrue();
    }
}
