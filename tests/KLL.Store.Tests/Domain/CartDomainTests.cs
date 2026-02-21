using FluentAssertions;
using KLL.Store.Domain.Entities;
using Xunit;

namespace KLL.Store.Tests.Domain;

public class CartDomainTests
{
    [Fact]
    public void Create_ShouldInitializeEmpty()
    {
        var cart = new Cart("user-123");

        cart.CustomerId.Should().Be("user-123");
        cart.Items.Should().BeEmpty();
        cart.Total.Should().Be(0);
        cart.ItemCount.Should().Be(0);
        cart.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void AddItem_ShouldAddNewItem()
    {
        var cart = new Cart("user-123");
        var productId = Guid.NewGuid();

        cart.AddItem(productId, "iPhone 15", 8999.99m, 1, "https://img.com/iphone.jpg");

        cart.Items.Should().HaveCount(1);
        cart.Items.First().ProductId.Should().Be(productId);
        cart.Items.First().ProductName.Should().Be("iPhone 15");
        cart.Items.First().UnitPrice.Should().Be(8999.99m);
        cart.Items.First().Quantity.Should().Be(1);
        cart.Total.Should().Be(8999.99m);
        cart.ItemCount.Should().Be(1);
    }

    [Fact]
    public void AddItem_SameProduct_ShouldIncrementQuantity()
    {
        var cart = new Cart("user-123");
        var productId = Guid.NewGuid();

        cart.AddItem(productId, "iPhone 15", 8999.99m, 1);
        cart.AddItem(productId, "iPhone 15", 8999.99m, 2);

        cart.Items.Should().HaveCount(1);
        cart.Items.First().Quantity.Should().Be(3);
        cart.Total.Should().Be(8999.99m * 3);
        cart.ItemCount.Should().Be(3);
    }

    [Fact]
    public void AddItem_DifferentProducts_ShouldAddBoth()
    {
        var cart = new Cart("user-123");
        var product1 = Guid.NewGuid();
        var product2 = Guid.NewGuid();

        cart.AddItem(product1, "iPhone 15", 8999.99m, 1);
        cart.AddItem(product2, "Galaxy S24", 6499.99m, 2);

        cart.Items.Should().HaveCount(2);
        cart.Total.Should().Be(8999.99m + 6499.99m * 2);
        cart.ItemCount.Should().Be(3);
    }

    [Fact]
    public void UpdateItemQuantity_ShouldChangeQuantity()
    {
        var cart = new Cart("user-123");
        var productId = Guid.NewGuid();
        cart.AddItem(productId, "iPhone 15", 8999.99m, 1);

        cart.UpdateItemQuantity(productId, 5);

        cart.Items.First().Quantity.Should().Be(5);
        cart.Total.Should().Be(8999.99m * 5);
    }

    [Fact]
    public void UpdateItemQuantity_ZeroOrLess_ShouldRemoveItem()
    {
        var cart = new Cart("user-123");
        var productId = Guid.NewGuid();
        cart.AddItem(productId, "iPhone 15", 8999.99m, 1);

        cart.UpdateItemQuantity(productId, 0);

        cart.Items.Should().BeEmpty();
        cart.Total.Should().Be(0);
    }

    [Fact]
    public void UpdateItemQuantity_NonExistentProduct_ShouldDoNothing()
    {
        var cart = new Cart("user-123");
        var productId = Guid.NewGuid();
        cart.AddItem(productId, "iPhone 15", 8999.99m, 1);

        cart.UpdateItemQuantity(Guid.NewGuid(), 5);

        cart.Items.Should().HaveCount(1);
        cart.Items.First().Quantity.Should().Be(1);
    }

    [Fact]
    public void RemoveItem_ShouldRemoveFromCart()
    {
        var cart = new Cart("user-123");
        var productId = Guid.NewGuid();
        cart.AddItem(productId, "iPhone 15", 8999.99m, 2);

        cart.RemoveItem(productId);

        cart.Items.Should().BeEmpty();
        cart.Total.Should().Be(0);
    }

    [Fact]
    public void RemoveItem_NonExistent_ShouldDoNothing()
    {
        var cart = new Cart("user-123");
        cart.AddItem(Guid.NewGuid(), "iPhone 15", 8999.99m, 1);

        cart.RemoveItem(Guid.NewGuid());

        cart.Items.Should().HaveCount(1);
    }

    [Fact]
    public void Clear_ShouldRemoveAllItems()
    {
        var cart = new Cart("user-123");
        cart.AddItem(Guid.NewGuid(), "iPhone 15", 8999.99m, 1);
        cart.AddItem(Guid.NewGuid(), "Galaxy S24", 6499.99m, 2);

        cart.Clear();

        cart.Items.Should().BeEmpty();
        cart.Total.Should().Be(0);
        cart.ItemCount.Should().Be(0);
    }
}

public class CartItemTests
{
    [Fact]
    public void Create_ShouldSetProperties()
    {
        var cartId = Guid.NewGuid();
        var productId = Guid.NewGuid();

        var item = new CartItem(cartId, productId, "iPhone 15", 8999.99m, 2, "https://img.com/iphone.jpg");

        item.CartId.Should().Be(cartId);
        item.ProductId.Should().Be(productId);
        item.ProductName.Should().Be("iPhone 15");
        item.UnitPrice.Should().Be(8999.99m);
        item.Quantity.Should().Be(2);
        item.ImageUrl.Should().Be("https://img.com/iphone.jpg");
        item.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void Total_ShouldBeUnitPriceTimesQuantity()
    {
        var item = new CartItem(Guid.NewGuid(), Guid.NewGuid(), "Test", 100m, 3, null);

        item.Total.Should().Be(300m);
    }

    [Fact]
    public void UpdateQuantity_ShouldChangeQuantity()
    {
        var item = new CartItem(Guid.NewGuid(), Guid.NewGuid(), "Test", 100m, 1, null);

        item.UpdateQuantity(5);

        item.Quantity.Should().Be(5);
        item.Total.Should().Be(500m);
    }
}
