using System.Text.Json;
using KLL.BuildingBlocks.Domain.Outbox;
using KLL.BuildingBlocks.Domain.Results;
using KLL.BuildingBlocks.Domain.ValueObjects;
using KLL.Store.Application.Commands;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Events;
using KLL.Store.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace KLL.Store.Application.Handlers;

public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, Result<Guid>>
{
    private readonly IOrderRepository _orderRepo;
    private readonly IProductRepository _productRepo;
    private readonly IOutboxRepository _outbox;
    private readonly ILogger<CreateOrderHandler> _logger;

    public CreateOrderHandler(IOrderRepository orderRepo, IProductRepository productRepo,
        IOutboxRepository outbox, ILogger<CreateOrderHandler> logger)
    { _orderRepo = orderRepo; _productRepo = productRepo; _outbox = outbox; _logger = logger; }

    public async Task<Result<Guid>> Handle(CreateOrderCommand cmd, CancellationToken ct)
    {
        var address = new Address(cmd.Street, cmd.Number, cmd.Complement, cmd.Neighborhood, cmd.City, cmd.State, cmd.ZipCode);
        var order = Order.Create(cmd.CustomerId, cmd.CustomerEmail, address);

        foreach (var item in cmd.Items)
        {
            var product = await _productRepo.GetByIdAsync(item.ProductId, ct);
            if (product == null) return Result.Failure<Guid>($"Product {item.ProductId} not found");
            if (product.StockQuantity < item.Quantity) return Result.Failure<Guid>($"Insufficient stock for {product.Name}");

            product.DeductStock(item.Quantity);
            order.AddItem(product.Id, product.Name, product.Price.Amount, item.Quantity);
            await _productRepo.UpdateAsync(product, ct);
        }

        await _orderRepo.AddAsync(order, ct);
        await _orderRepo.SaveChangesAsync(ct);

        // Outbox: publish OrderCreated for KLL Pay
        var integrationEvent = new OrderCreatedIntegrationEvent
        {
            OrderId = order.Id, CustomerId = cmd.CustomerId,
            CustomerEmail = cmd.CustomerEmail, TotalAmount = order.TotalAmount.Amount
        };
        await _outbox.AddAsync(OutboxMessage.Create(
            nameof(OrderCreatedIntegrationEvent),
            JsonSerializer.Serialize(integrationEvent)), ct);

        _logger.LogInformation("Order {OrderId} created with {ItemCount} items, total {Total}",
            order.Id, cmd.Items.Count, order.TotalAmount.Amount);

        return Result.Success(order.Id);
    }
}