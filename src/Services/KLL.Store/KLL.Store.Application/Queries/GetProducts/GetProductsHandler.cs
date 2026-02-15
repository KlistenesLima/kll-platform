using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.BuildingBlocks.Domain.Results;
using KLL.Store.Application.DTOs.Responses;
using KLL.Store.Domain.Interfaces;

namespace KLL.Store.Application.Queries.GetProducts;

public class GetProductsHandler : IQueryHandler<GetProductsQuery, List<ProductResponse>>
{
    private readonly IProductRepository _repository;

    public GetProductsHandler(IProductRepository repository) => _repository = repository;

    public async Task<Result<List<ProductResponse>>> Handle(GetProductsQuery query, CancellationToken ct)
    {
        var products = !string.IsNullOrEmpty(query.Search)
            ? await _repository.SearchAsync(query.Search, ct)
            : !string.IsNullOrEmpty(query.Category)
                ? await _repository.GetByCategoryAsync(query.Category, ct)
                : await _repository.GetAllAsync(ct);

        var result = products.Select(p => new ProductResponse(
            p.Id, p.Name, p.Description, p.Price.Amount, p.StockQuantity,
            p.Category, p.ImageUrl, p.IsActive, p.CreatedAt
        )).ToList();

        return Result.Success(result);
    }
}
