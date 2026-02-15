using KLL.BuildingBlocks.CQRS.Abstractions;

namespace KLL.Store.Application.Commands.CreateProduct;

public record CreateProductCommand(
    string Name,
    string Description,
    decimal Price,
    int StockQuantity,
    string Category,
    string? ImageUrl = null
) : ICommand<Guid>;
