using FluentAssertions;
using KLL.Store.Domain.Entities;
using Xunit;

namespace KLL.Store.Tests;

public class ProductTests
{
    [Fact]
    public void Create_ValidProduct_ShouldSucceed()
    {
        var product = Product.Create("Smartphone", "Latest model", 2999.90m, 50, "Electronics");

        product.Name.Should().Be("Smartphone");
        product.Price.Amount.Should().Be(2999.90m);
        product.StockQuantity.Should().Be(50);
        product.IsActive.Should().BeTrue();
        product.DomainEvents.Should().HaveCount(1);
    }

    [Fact]
    public void DeductStock_SufficientStock_ShouldDeduct()
    {
        var product = Product.Create("Test", "Desc", 100m, 10, "Cat");
        product.ClearDomainEvents();

        product.DeductStock(3);

        product.StockQuantity.Should().Be(7);
        product.DomainEvents.Should().HaveCount(1);
    }

    [Fact]
    public void DeductStock_InsufficientStock_ShouldThrow()
    {
        var product = Product.Create("Test", "Desc", 100m, 2, "Cat");

        var act = () => product.DeductStock(5);

        act.Should().Throw<InvalidOperationException>().WithMessage("*Insufficient stock*");
    }

    [Fact]
    public void Update_ShouldChangeProperties()
    {
        var product = Product.Create("Old Name", "Old Desc", 100m, 10, "OldCat");

        product.Update("New Name", "New Desc", 200m, "NewCat", "http://img.jpg");

        product.Name.Should().Be("New Name");
        product.Price.Amount.Should().Be(200m);
        product.Category.Should().Be("NewCat");
        product.UpdatedAt.Should().NotBeNull();
    }
}
