using FluentAssertions;
using KLL.Store.Domain.Entities;
using KLL.BuildingBlocks.Domain.ValueObjects;
using Xunit;

namespace KLL.Store.IntegrationTests;

public class OrderLifecycleTests
{
    [Fact]
    public void FullOrderLifecycle_ShouldTransitionThroughAllStatuses()
    {
        var addr = new Address("Rua Test", "100", null, "Centro", "SP", "SP", "01000-000");
        var order = Order.Create("user-1", "user@email.com", addr);

        order.Status.Should().Be(OrderStatus.Pending);

        var productId = Guid.NewGuid();
        order.AddItem(productId, "Anel de Ouro", 2500m, 1);
        order.AddItem(Guid.NewGuid(), "Brinco Prata", 450m, 2);
        order.TotalAmount.Amount.Should().Be(3400m);

        order.ConfirmPayment("pix-charge-123");
        order.Status.Should().Be(OrderStatus.Paid);
        order.PaymentChargeId.Should().Be("pix-charge-123");

        order.SetShipped("KLL20260218ABC");
        order.Status.Should().Be(OrderStatus.Shipped);
        order.TrackingCode.Should().Be("KLL20260218ABC");

        order.SetDelivered();
        order.Status.Should().Be(OrderStatus.Delivered);
    }

    [Fact]
    public void OrderCancel_ShouldRaiseEvent()
    {
        var addr = new Address("Rua Test", "100", null, "Centro", "SP", "SP", "01000-000");
        var order = Order.Create("user-1", "user@email.com", addr);
        order.AddItem(Guid.NewGuid(), "Product", 100m, 1);
        order.ClearDomainEvents();

        order.Cancel();

        order.Status.Should().Be(OrderStatus.Cancelled);
        order.DomainEvents.Should().ContainSingle(e => e.GetType().Name == "OrderCancelledEvent");
    }
}
