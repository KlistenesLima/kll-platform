using KLL.BuildingBlocks.CQRS;
using KLL.Store.Application.DTOs.Responses;
using MediatR;

namespace KLL.Store.Application.Commands;

public record CreateProductCommand(
    string Name, string Description, decimal Price,
    int StockQuantity, string Category, string? ImageUrl = null
) : IRequest<Result<ProductResponse>>;
