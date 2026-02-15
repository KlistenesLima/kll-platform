using KLL.BuildingBlocks.Domain.Events;

namespace KLL.Store.Domain.Events;

public class OrderCreatedIntegrationEvent : IntegrationEvent
{
    public Guid OrderId { get; set; }
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string? WebhookUrl { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}

public class PaymentConfirmedIntegrationEvent : IntegrationEvent
{
    public Guid OrderId { get; set; }
    public string ChargeId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class ShipmentRequestedIntegrationEvent : IntegrationEvent
{
    public Guid OrderId { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public string RecipientEmail { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public decimal Weight { get; set; }
}
