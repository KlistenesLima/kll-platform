using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.BuildingBlocks.Infrastructure.RealTime;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Events;
using KLL.Store.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace KLL.Store.Application.Saga;

public class OrderSagaOrchestrator
{
    private readonly IOrderRepository _orderRepo;
    private readonly IProductRepository _productRepo;
    private readonly IEventBus _eventBus;
    private readonly IOrderNotifier _notifier;
    private readonly ILogger<OrderSagaOrchestrator> _logger;

    public OrderSagaOrchestrator(
        IOrderRepository orderRepo, IProductRepository productRepo,
        IEventBus eventBus, IOrderNotifier notifier, ILogger<OrderSagaOrchestrator> logger)
    {
        _orderRepo = orderRepo; _productRepo = productRepo;
        _eventBus = eventBus; _notifier = notifier; _logger = logger;
    }

    /// <summary>Step 1: Reserve stock and publish OrderCreated</summary>
    public async Task StartAsync(Order order, CancellationToken ct)
    {
        _logger.LogInformation("Saga START for order {OrderId}", order.Id);

        // Reserve stock
        foreach (var item in order.Items)
        {
            var product = await _productRepo.GetByIdAsync(item.ProductId, ct);
            if (product == null || product.StockQuantity < item.Quantity)
            {
                await CompensateStockAsync(order, ct);
                throw new InvalidOperationException($"Insufficient stock for product {item.ProductId}");
            }
            product.DeductStock(item.Quantity);
            await _productRepo.UpdateAsync(product, ct);
        }
        await _productRepo.SaveChangesAsync(ct);

        // Publish to Pay
        await _eventBus.PublishAsync(new OrderCreatedIntegrationEvent
        {
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            CustomerEmail = order.CustomerEmail,
            TotalAmount = order.TotalAmount.Amount,
            Items = order.Items.Select(i => new OrderItemDto { ProductId = i.ProductId, ProductName = i.ProductName, UnitPrice = i.UnitPrice, Quantity = i.Quantity }).ToList()
        }, ct);

        _logger.LogInformation("Saga Step 1 complete: stock reserved, OrderCreated published");
    }

    /// <summary>Step 2: Payment confirmed - trigger shipment</summary>
    public async Task OnPaymentConfirmedAsync(Guid orderId, string chargeId, CancellationToken ct)
    {
        _logger.LogInformation("Saga Step 2: Payment confirmed for {OrderId}", orderId);

        var order = await _orderRepo.GetWithItemsAsync(orderId, ct)
            ?? throw new InvalidOperationException($"Order {orderId} not found");

        order.ConfirmPayment(chargeId);
        await _orderRepo.UpdateAsync(order, ct);
        await _orderRepo.SaveChangesAsync(ct);

        await _notifier.NotifyPaymentConfirmed(orderId.ToString(), order.TotalAmount.Amount);
        await _notifier.NotifyOrderStatusChanged(orderId.ToString(), "Paid");

        // Publish to Logistics
        var addr = order.ShippingAddress;
        await _eventBus.PublishAsync(new ShipmentRequestedIntegrationEvent
        {
            OrderId = orderId,
            RecipientName = order.CustomerId,
            RecipientEmail = order.CustomerEmail,
            Street = addr.Street, Number = addr.Number,
            City = addr.City, State = addr.State, ZipCode = addr.ZipCode,
            Weight = order.Items.Sum(i => i.Quantity) * 0.5m
        }, ct);

        _logger.LogInformation("Saga Step 2 complete: order paid, shipment requested");
    }

    /// <summary>Step 3: Shipment created - update tracking</summary>
    public async Task OnShipmentCreatedAsync(Guid orderId, string trackingCode, CancellationToken ct)
    {
        _logger.LogInformation("Saga Step 3: Shipment created for {OrderId}, tracking {Code}", orderId, trackingCode);

        var order = await _orderRepo.GetByIdAsync(orderId, ct);
        if (order == null) return;

        order.SetShipped(trackingCode);
        await _orderRepo.UpdateAsync(order, ct);
        await _orderRepo.SaveChangesAsync(ct);

        await _notifier.NotifyOrderStatusChanged(orderId.ToString(), "Shipped", trackingCode);
        _logger.LogInformation("Saga Step 3 complete: order shipped");
    }

    /// <summary>Step 4: Delivery confirmed</summary>
    public async Task OnDeliveryConfirmedAsync(Guid orderId, CancellationToken ct)
    {
        _logger.LogInformation("Saga Step 4: Delivery confirmed for {OrderId}", orderId);

        var order = await _orderRepo.GetByIdAsync(orderId, ct);
        if (order == null) return;

        order.SetDelivered();
        await _orderRepo.UpdateAsync(order, ct);
        await _orderRepo.SaveChangesAsync(ct);

        await _notifier.NotifyOrderStatusChanged(orderId.ToString(), "Delivered");
        _logger.LogInformation("Saga COMPLETE for order {OrderId}", orderId);
    }

    /// <summary>Compensation: reverse stock deduction</summary>
    public async Task CompensateStockAsync(Order order, CancellationToken ct)
    {
        _logger.LogWarning("COMPENSATING: Reversing stock for order {OrderId}", order.Id);
        foreach (var item in order.Items)
        {
            var product = await _productRepo.GetByIdAsync(item.ProductId, ct);
            if (product != null)
            {
                product.RestoreStock(item.Quantity);
                await _productRepo.UpdateAsync(product, ct);
            }
        }
        await _productRepo.SaveChangesAsync(ct);
        order.Cancel();
        await _orderRepo.UpdateAsync(order, ct);
        await _orderRepo.SaveChangesAsync(ct);
    }

    /// <summary>Compensation: payment failed - reverse everything</summary>
    public async Task CompensatePaymentFailedAsync(Guid orderId, string reason, CancellationToken ct)
    {
        _logger.LogWarning("COMPENSATING: Payment failed for order {OrderId}: {Reason}", orderId, reason);
        var order = await _orderRepo.GetWithItemsAsync(orderId, ct);
        if (order == null) return;

        await CompensateStockAsync(order, ct);
        await _notifier.NotifyOrderStatusChanged(orderId.ToString(), "Cancelled");
    }
}
