using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.BuildingBlocks.Domain.Results;
using KLL.Store.Application.DTOs.Responses;
using KLL.Store.Domain.Interfaces;

namespace KLL.Store.Application.Queries.SearchProducts;

public class SearchProductsHandler : IQueryHandler<SearchProductsQuery, List<ProductResponse>>
{
    private readonly IProductRepository _repository;

    public SearchProductsHandler(IProductRepository repository) => _repository = repository;

    public async Task<Result<List<ProductResponse>>> Handle(SearchProductsQuery query, CancellationToken ct)
    {
        var products = await _repository.SearchAsync(query.Term, ct);
        var result = products.Select(p => new ProductResponse(
            p.Id, p.Name, p.Description, p.Price, p.StockQuantity,
            p.Category, p.ImageUrl, p.IsActive, p.CreatedAt)).ToList();
        return Result.Success(result);
    }
}
