using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.BuildingBlocks.Domain.ValueObjects;
using KLL.Store.Application.DTOs.Requests;
using KLL.Store.Application.DTOs.Responses;
using KLL.Store.Application.Interfaces;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Events;
using KLL.Store.Domain.Interfaces;

namespace KLL.Store.Application.Services;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepo;
    private readonly IProductRepository _productRepo;
    private readonly IEventBus _eventBus;

    public OrderService(IOrderRepository orderRepo, IProductRepository productRepo, IEventBus eventBus)
    { _orderRepo = orderRepo; _productRepo = productRepo; _eventBus = eventBus; }

    public async Task<OrderResponse> CreateAsync(CreateOrderRequest req, CancellationToken ct)
    {
        var address = new Address(req.Street, req.Number, req.Complement, req.Neighborhood, req.City, req.State, req.ZipCode);
        var order = Order.Create(req.CustomerId, req.CustomerEmail, address);

        foreach (var item in req.Items)
        {
            var product = await _productRepo.GetByIdAsync(item.ProductId, ct)
                ?? throw new KeyNotFoundException($"Product {item.ProductId} not found");
            product.DeductStock(item.Quantity);
            order.AddItem(product.Id, product.Name, product.Price.Amount, item.Quantity);
            await _productRepo.UpdateAsync(product, ct);
        }

        await _orderRepo.AddAsync(order, ct);
        await _orderRepo.SaveChangesAsync(ct);

        // Publish integration event for KLL Pay
        await _eventBus.PublishAsync(new OrderCreatedIntegrationEvent
        {
            OrderId = order.Id, CustomerId = order.CustomerId,
            CustomerEmail = order.CustomerEmail, TotalAmount = order.TotalAmount.Amount,
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId, ProductName = i.ProductName,
                UnitPrice = i.UnitPrice, Quantity = i.Quantity
            }).ToList()
        }, ct);

        return MapOrder(order);
    }

    public async Task<OrderResponse?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var o = await _orderRepo.GetWithItemsAsync(id, ct);
        return o is null ? null : MapOrder(o);
    }

    public async Task<IEnumerable<OrderResponse>> GetByCustomerAsync(string customerId, CancellationToken ct)
    {
        var orders = await _orderRepo.GetByCustomerIdAsync(customerId, ct);
        return orders.Select(MapOrder);
    }

    public async Task ConfirmPaymentAsync(Guid orderId, string chargeId, CancellationToken ct)
    {
        var order = await _orderRepo.GetByIdAsync(orderId, ct)
            ?? throw new KeyNotFoundException($"Order {orderId} not found");
        order.ConfirmPayment(chargeId);
        await _orderRepo.UpdateAsync(order, ct);
        await _orderRepo.SaveChangesAsync(ct);

        // Request shipment from KLL Logistics
        await _eventBus.PublishAsync(new ShipmentRequestedIntegrationEvent
        {
            OrderId = order.Id, RecipientName = order.CustomerId,
            RecipientEmail = order.CustomerEmail,
            Street = order.ShippingAddress!.Street, Number = order.ShippingAddress.Number,
            City = order.ShippingAddress.City, State = order.ShippingAddress.State,
            ZipCode = order.ShippingAddress.ZipCode, Weight = 1.0m
        }, ct);
    }

    private static OrderResponse MapOrder(Order o) => new(o.Id, o.CustomerId, o.Status.ToString(),
        o.TotalAmount.Amount, o.TrackingCode, o.CreatedAt,
        o.Items.Select(i => new OrderItemResponse(i.ProductId, i.ProductName, i.UnitPrice, i.Quantity, i.Total)).ToList());
}