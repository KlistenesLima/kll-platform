using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.BuildingBlocks.Domain.Results;
using KLL.Store.Application.DTOs.Responses;
using KLL.Store.Domain.Interfaces;

namespace KLL.Store.Application.Queries.GetProductById;

public class GetProductByIdHandler : IQueryHandler<GetProductByIdQuery, ProductResponse>
{
    private readonly IProductRepository _repository;

    public GetProductByIdHandler(IProductRepository repository) => _repository = repository;

    public async Task<Result<ProductResponse>> Handle(GetProductByIdQuery query, CancellationToken ct)
    {
        var p = await _repository.GetByIdAsync(query.ProductId, ct);
        if (p == null) return Result.Failure<ProductResponse>("Product not found");

        return Result.Success(new ProductResponse(
            p.Id, p.Name, p.Description, p.Price.Amount, p.StockQuantity,
            p.Category, p.ImageUrl, p.IsActive, p.CreatedAt));
    }
}
