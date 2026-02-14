using System.Text.Json;
using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.BuildingBlocks.Domain.Results;
using KLL.BuildingBlocks.Domain.ValueObjects;
using KLL.BuildingBlocks.Infrastructure.Outbox;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Events;
using KLL.Store.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace KLL.Store.Application.Commands.CreateOrder;

public class CreateOrderHandler : ICommandHandler<CreateOrderCommand, Guid>
{
    private readonly IOrderRepository _orderRepo;
    private readonly IProductRepository _productRepo;
    private readonly DbContext _dbContext;
    private readonly ILogger<CreateOrderHandler> _logger;

    public CreateOrderHandler(IOrderRepository orderRepo, IProductRepository productRepo,
        DbContext dbContext, ILogger<CreateOrderHandler> logger)
    { _orderRepo = orderRepo; _productRepo = productRepo; _dbContext = dbContext; _logger = logger; }

    public async Task<Result<Guid>> Handle(CreateOrderCommand cmd, CancellationToken ct)
    {
        var address = new Address(cmd.Street, cmd.Number, cmd.Complement, cmd.Neighborhood, cmd.City, cmd.State, cmd.ZipCode);
        var order = Order.Create(cmd.CustomerId, cmd.CustomerEmail, address);

        foreach (var item in cmd.Items)
        {
            var product = await _productRepo.GetByIdAsync(item.ProductId, ct);
            if (product == null) return Result.Failure<Guid>($"Product {item.ProductId} not found");
            if (product.StockQuantity < item.Quantity) return Result.Failure<Guid>($"Insufficient stock for {product.Name}");

            order.AddItem(product.Id, product.Name, product.Price.Amount, item.Quantity);
            product.DeductStock(item.Quantity);
        }

        await _orderRepo.AddAsync(order, ct);

        // Outbox: publish OrderCreated event
        _dbContext.Set<OutboxMessage>().Add(new OutboxMessage
        {
            Type = typeof(OrderCreatedIntegrationEvent).FullName!,
            Content = JsonSerializer.Serialize(new OrderCreatedIntegrationEvent
            {
                OrderId = order.Id,
                CustomerId = cmd.CustomerId,
                CustomerEmail = cmd.CustomerEmail,
                TotalAmount = order.TotalAmount.Amount,
                ShippingAddress = address
            })
        });

        await _dbContext.SaveChangesAsync(ct);

        _logger.LogInformation("Order {OrderId} created for customer {CustomerId}, total: {Total}",
            order.Id, cmd.CustomerId, order.TotalAmount);
        return Result.Success(order.Id);
    }
}