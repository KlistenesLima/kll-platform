using FluentAssertions;
using KLL.BuildingBlocks.Domain.ValueObjects;
using KLL.Store.Domain.Entities;
using Xunit;

namespace KLL.Store.Tests;

public class OrderTests
{
    private readonly Address _address = new("Rua Test", "123", null, "Centro", "Recife", "PE", "50000-000");

    [Fact]
    public void Create_ShouldInitializePending()
    {
        var order = Order.Create("cust-1", "test@email.com", _address);

        order.Status.Should().Be(OrderStatus.Pending);
        order.Items.Should().BeEmpty();
        order.TotalAmount.Amount.Should().Be(0);
    }

    [Fact]
    public void AddItem_ShouldRecalculateTotal()
    {
        var order = Order.Create("cust-1", "test@email.com", _address);

        order.AddItem(Guid.NewGuid(), "Product A", 100m, 2);
        order.AddItem(Guid.NewGuid(), "Product B", 50m, 1);

        order.Items.Should().HaveCount(2);
        order.TotalAmount.Amount.Should().Be(250m);
    }

    [Fact]
    public void ConfirmPayment_ShouldTransitionToPaid()
    {
        var order = Order.Create("cust-1", "test@email.com", _address);
        order.AddItem(Guid.NewGuid(), "Product", 100m, 1);

        order.ConfirmPayment("charge-123");

        order.Status.Should().Be(OrderStatus.Paid);
        order.PaymentChargeId.Should().Be("charge-123");
        order.DomainEvents.Should().ContainSingle(e => e.GetType().Name == "OrderPaidEvent");
    }

    [Fact]
    public void SetShipped_ShouldHaveTrackingCode()
    {
        var order = Order.Create("cust-1", "test@email.com", _address);
        order.ConfirmPayment("charge-123");

        order.SetShipped("KLL20250213ABC");

        order.Status.Should().Be(OrderStatus.Shipped);
        order.TrackingCode.Should().Be("KLL20250213ABC");
    }

    [Fact]
    public void Cancel_ShouldSetCancelled()
    {
        var order = Order.Create("cust-1", "test@email.com", _address);

        order.Cancel();

        order.Status.Should().Be(OrderStatus.Cancelled);
    }
}