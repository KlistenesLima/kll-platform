using FluentAssertions;
using KLL.Store.Application.Commands.CreateProduct;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace KLL.Store.Tests.Handlers;

public class CreateProductHandlerTests
{
    private readonly Mock<IProductRepository> _productRepo = new();
    private readonly Mock<ILogger<CreateProductHandler>> _logger = new();
    private readonly CreateProductHandler _handler;

    public CreateProductHandlerTests()
    {
        _handler = new CreateProductHandler(_productRepo.Object, _logger.Object);
    }

    [Fact]
    public async Task Handle_ValidCommand_ShouldCreateProduct()
    {
        _productRepo.Setup(r => r.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product p, CancellationToken _) => p);
        _productRepo.Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var command = new CreateProductCommand("Smartphone", "Latest model", 2999.90m, 50, "Electronics", null);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBe(Guid.Empty);
        _productRepo.Verify(r => r.AddAsync(It.Is<Product>(p => p.Name == "Smartphone"), It.IsAny<CancellationToken>()), Times.Once);
    }
}