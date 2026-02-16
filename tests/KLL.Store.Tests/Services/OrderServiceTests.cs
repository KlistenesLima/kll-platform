using FluentAssertions;
using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.Store.Application.DTOs.Requests;
using KLL.Store.Application.Services;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Events;
using KLL.Store.Domain.Interfaces;
using Moq;
using Xunit;

namespace KLL.Store.Tests.Services;

public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _orderRepoMock;
    private readonly Mock<IProductRepository> _productRepoMock;
    private readonly Mock<IEventBus> _eventBusMock;
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        _orderRepoMock = new Mock<IOrderRepository>();
        _productRepoMock = new Mock<IProductRepository>();
        _eventBusMock = new Mock<IEventBus>();
        _sut = new OrderService(_orderRepoMock.Object, _productRepoMock.Object, _eventBusMock.Object);
    }

    [Fact]
    public async Task CreateAsync_ValidOrder_ShouldCreateAndPublishEvent()
    {
        var product = new Product("iPhone 15", "Apple", 8999.99m, 50, "Eletronicos");
        _productRepoMock.Setup(r => r.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);
        _orderRepoMock.Setup(r => r.AddAsync(It.IsAny<Order>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Order o, CancellationToken _) => o);

        var request = new CreateOrderRequest(
            "user-123", "user@email.com",
            "Rua A", "100", null, "Centro", "SP", "SP", "01000-000",
            new List<OrderItemRequest> { new(product.Id, 2) });

        var result = await _sut.CreateAsync(request, CancellationToken.None);

        result.Should().NotBeNull();
        result.CustomerId.Should().Be("user-123");
        result.Status.Should().Be("Pending");
        result.Items.Should().HaveCount(1);
        product.StockQuantity.Should().Be(48);
        _eventBusMock.Verify(e => e.PublishAsync(It.IsAny<OrderCreatedIntegrationEvent>(), It.IsAny<CancellationToken>()), Times.Once);
        _orderRepoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_ProductNotFound_ShouldThrow()
    {
        _productRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        var request = new CreateOrderRequest(
            "user-123", "user@email.com",
            "Rua A", "100", null, "Centro", "SP", "SP", "01000-000",
            new List<OrderItemRequest> { new(Guid.NewGuid(), 1) });

        var act = () => _sut.CreateAsync(request, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task CreateAsync_InsufficientStock_ShouldThrow()
    {
        var product = new Product("iPhone 15", "Apple", 8999.99m, 1, "Eletronicos");
        _productRepoMock.Setup(r => r.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        var request = new CreateOrderRequest(
            "user-123", "user@email.com",
            "Rua A", "100", null, "Centro", "SP", "SP", "01000-000",
            new List<OrderItemRequest> { new(product.Id, 10) });

        var act = () => _sut.CreateAsync(request, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task GetByIdAsync_ExistingOrder_ShouldReturn()
    {
        var order = Order.Create("user-123", "user@email.com",
            new KLL.BuildingBlocks.Domain.ValueObjects.Address("Rua A", "100", null, "Centro", "SP", "SP", "01000-000"));
        order.AddItem(Guid.NewGuid(), "iPhone", 8999.99m, 1);

        _orderRepoMock.Setup(r => r.GetWithItemsAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        var result = await _sut.GetByIdAsync(order.Id, CancellationToken.None);

        result.Should().NotBeNull();
        result!.CustomerId.Should().Be("user-123");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistent_ShouldReturnNull()
    {
        _orderRepoMock.Setup(r => r.GetWithItemsAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Order?)null);

        var result = await _sut.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByCustomerAsync_ShouldReturnOrders()
    {
        var order = Order.Create("user-123", "user@email.com",
            new KLL.BuildingBlocks.Domain.ValueObjects.Address("Rua A", "100", null, "Centro", "SP", "SP", "01000-000"));
        order.AddItem(Guid.NewGuid(), "iPhone", 8999.99m, 1);

        _orderRepoMock.Setup(r => r.GetByCustomerIdAsync("user-123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { order });

        var result = await _sut.GetByCustomerAsync("user-123", CancellationToken.None);

        result.Should().HaveCount(1);
    }

    [Fact]
    public async Task ConfirmPaymentAsync_ShouldConfirmAndPublishEvent()
    {
        var order = Order.Create("user-123", "user@email.com",
            new KLL.BuildingBlocks.Domain.ValueObjects.Address("Rua A", "100", null, "Centro", "SP", "SP", "01000-000"));
        order.AddItem(Guid.NewGuid(), "iPhone", 8999.99m, 1);

        _orderRepoMock.Setup(r => r.GetByIdAsync(order.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        await _sut.ConfirmPaymentAsync(order.Id, "charge-123", CancellationToken.None);

        order.Status.Should().Be(OrderStatus.Paid);
        order.PaymentChargeId.Should().Be("charge-123");
        _eventBusMock.Verify(e => e.PublishAsync(It.IsAny<ShipmentRequestedIntegrationEvent>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task ConfirmPaymentAsync_OrderNotFound_ShouldThrow()
    {
        _orderRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Order?)null);

        var act = () => _sut.ConfirmPaymentAsync(Guid.NewGuid(), "charge-123", CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }
}
