using FluentAssertions;
using KLL.BuildingBlocks.Domain.ValueObjects;
using KLL.Store.Domain.Entities;
using Xunit;

namespace KLL.Store.Tests.Domain;

public class OrderDomainTests
{
    private readonly Address _addr = new("Rua A", "1", null, "Centro", "Recife", "PE", "50000-000");

    [Fact]
    public void FullLifecycle_ShouldTransitionCorrectly()
    {
        var order = Order.Create("c1", "c@e.com", _addr);
        order.AddItem(Guid.NewGuid(), "P1", 50m, 2);
        order.AddItem(Guid.NewGuid(), "P2", 30m, 1);

        order.TotalAmount.Amount.Should().Be(130m);
        order.Status.Should().Be(OrderStatus.Pending);

        order.ConfirmPayment("ch-1");
        order.Status.Should().Be(OrderStatus.Paid);

        order.SetShipped("KLL123");
        order.Status.Should().Be(OrderStatus.Shipped);
        order.TrackingCode.Should().Be("KLL123");

        order.SetDelivered();
        order.Status.Should().Be(OrderStatus.Delivered);
    }

    [Fact]
    public void Cancel_ShouldRaiseDomainEvent()
    {
        var order = Order.Create("c1", "c@e.com", _addr);
        order.AddItem(Guid.NewGuid(), "P1", 100m, 1);
        order.ClearDomainEvents();

        order.Cancel();

        order.Status.Should().Be(OrderStatus.Cancelled);
        order.DomainEvents.Should().ContainSingle(e => e.GetType().Name == "OrderCancelledEvent");
    }
}
