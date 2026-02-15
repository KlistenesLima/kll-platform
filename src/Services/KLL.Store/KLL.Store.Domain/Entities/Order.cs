using KLL.BuildingBlocks.Domain.Entities;
using KLL.BuildingBlocks.Domain.ValueObjects;
using KLL.Store.Domain.Events;

namespace KLL.Store.Domain.Entities;

public class Order : BaseEntity
{
    public string CustomerId { get; private set; } = string.Empty;
    public string CustomerEmail { get; private set; } = string.Empty;
    public Money TotalAmount { get; private set; } = Money.Zero;
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public Address? ShippingAddress { get; private set; }
    public string? PaymentChargeId { get; private set; }
    public string? TrackingCode { get; private set; }

    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    private Order() { }

    public static Order Create(string customerId, string customerEmail, Address shippingAddress)
    {
        return new Order { CustomerId = customerId, CustomerEmail = customerEmail, ShippingAddress = shippingAddress };
    }

    public void AddItem(Guid productId, string productName, decimal unitPrice, int quantity)
    {
        var item = new OrderItem(productId, productName, unitPrice, quantity);
        _items.Add(item);
        RecalculateTotal();
    }

    public void ConfirmPayment(string chargeId)
    {
        PaymentChargeId = chargeId;
        Status = OrderStatus.Paid;
        SetUpdated();
        AddDomainEvent(new OrderPaidEvent(Id, CustomerId, TotalAmount.Amount, chargeId));
    }

    public void SetShipped(string trackingCode)
    {
        TrackingCode = trackingCode;
        Status = OrderStatus.Shipped;
        SetUpdated();
        AddDomainEvent(new OrderShippedEvent(Id, trackingCode));
    }

    public void SetDelivered()
    {
        Status = OrderStatus.Delivered;
        SetUpdated();
    }

    public void Cancel()
    {
        Status = OrderStatus.Cancelled;
        SetUpdated();
        AddDomainEvent(new OrderCancelledEvent(Id, CustomerId, TotalAmount.Amount));
    }

    private void RecalculateTotal()
    {
        var total = _items.Sum(i => i.UnitPrice * i.Quantity);
        TotalAmount = new Money(total);
    }
}

public class OrderItem
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; }
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public decimal Total => UnitPrice * Quantity;

    public OrderItem(Guid productId, string productName, decimal unitPrice, int quantity)
    {
        ProductId = productId; ProductName = productName;
        UnitPrice = unitPrice; Quantity = quantity;
    }
    private OrderItem() { ProductName = string.Empty; }
}

public enum OrderStatus { Pending, Paid, Processing, Shipped, Delivered, Cancelled }
