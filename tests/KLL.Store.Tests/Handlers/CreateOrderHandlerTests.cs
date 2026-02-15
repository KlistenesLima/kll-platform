using FluentAssertions;
using KLL.BuildingBlocks.Domain.Outbox;
using KLL.Store.Application.Commands.CreateOrder;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace KLL.Store.Tests.Handlers;

public class CreateOrderHandlerTests
{
    private readonly Mock<IOrderRepository> _orderRepo = new();
    private readonly Mock<IProductRepository> _productRepo = new();
    private readonly Mock<IOutboxRepository> _outbox = new();
    private readonly Mock<ILogger<CreateOrderHandler>> _logger = new();
    private readonly CreateOrderHandler _handler;

    public CreateOrderHandlerTests()
    {
        _handler = new CreateOrderHandler(_orderRepo.Object, _productRepo.Object, _outbox.Object, _logger.Object);
    }

    [Fact]
    public async Task Handle_ValidOrder_ShouldCreateWithItems()
    {
        var product = Product.Create("Test Product", "Desc", 100m, 20, "Cat");

        _productRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _orderRepo.Setup(r => r.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Order o, CancellationToken _) => o);
        _orderRepo.Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);
        _outbox.Setup(r => r.AddAsync(It.IsAny<OutboxMessage>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var command = new CreateOrderCommand(
            "customer-1", "test@email.com",
            "Rua A", "100", null, "Centro", "Recife", "PE", "50000-000",
            new List<OrderItemInput> { new(product.Id, 2) });

        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        _orderRepo.Verify(r => r.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}