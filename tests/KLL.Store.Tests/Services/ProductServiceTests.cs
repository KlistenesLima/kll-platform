using FluentAssertions;
using KLL.Store.Application.DTOs.Requests;
using KLL.Store.Application.Services;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Moq;
using Xunit;

namespace KLL.Store.Tests.Services;

public class ProductServiceTests
{
    private readonly Mock<IProductRepository> _repoMock;
    private readonly ProductService _sut;

    public ProductServiceTests()
    {
        _repoMock = new Mock<IProductRepository>();
        _sut = new ProductService(_repoMock.Object);
    }

    [Fact]
    public async Task CreateAsync_ShouldCreateAndReturnProduct()
    {
        var request = new CreateProductRequest("iPhone 15", "Apple phone", 8999.99m, 50, "Eletronicos", null);
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product p, CancellationToken _) => p);

        var result = await _sut.CreateAsync(request, CancellationToken.None);

        result.Name.Should().Be("iPhone 15");
        result.Price.Should().Be(8999.99m);
        result.StockQuantity.Should().Be(50);
        _repoMock.Verify(r => r.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()), Times.Once);
        _repoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetByIdAsync_ExistingProduct_ShouldReturn()
    {
        var product = new Product("Test", "Desc", 100m, 10, "Cat");
        _repoMock.Setup(r => r.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        var result = await _sut.GetByIdAsync(product.Id, CancellationToken.None);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Test");
    }

    [Fact]
    public async Task GetByIdAsync_NonExistent_ShouldReturnNull()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        var result = await _sut.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllProducts()
    {
        var products = new[]
        {
            new Product("Product 1", "Desc 1", 100m, 10, "Cat"),
            new Product("Product 2", "Desc 2", 200m, 20, "Cat")
        };
        _repoMock.Setup(r => r.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(products);

        var result = await _sut.GetAllAsync(CancellationToken.None);

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task SearchAsync_ShouldReturnMatchingProducts()
    {
        var products = new[] { new Product("iPhone 15", "Apple", 8999m, 10, "Eletronicos") };
        _repoMock.Setup(r => r.SearchAsync("iPhone", It.IsAny<CancellationToken>()))
            .ReturnsAsync(products);

        var result = await _sut.SearchAsync("iPhone", CancellationToken.None);

        result.Should().HaveCount(1);
        result.First().Name.Should().Be("iPhone 15");
    }

    [Fact]
    public async Task UpdateAsync_ExistingProduct_ShouldUpdate()
    {
        var product = new Product("Old Name", "Old Desc", 100m, 10, "Cat");
        _repoMock.Setup(r => r.GetByIdAsync(product.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(product);

        var request = new UpdateProductRequest("New Name", "New Desc", 200m, "NewCat", "https://img.com/new.jpg");
        var result = await _sut.UpdateAsync(product.Id, request, CancellationToken.None);

        result.Name.Should().Be("New Name");
        result.Price.Should().Be(200m);
        _repoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_NonExistent_ShouldThrow()
    {
        _repoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product?)null);

        var request = new UpdateProductRequest("Name", "Desc", 100m, "Cat", null);
        var act = () => _sut.UpdateAsync(Guid.NewGuid(), request, CancellationToken.None);

        await act.Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task DeleteAsync_ShouldCallRepository()
    {
        var id = Guid.NewGuid();

        await _sut.DeleteAsync(id, CancellationToken.None);

        _repoMock.Verify(r => r.DeleteAsync(id, It.IsAny<CancellationToken>()), Times.Once);
        _repoMock.Verify(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
