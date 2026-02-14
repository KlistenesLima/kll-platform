using KLL.Store.Application.DTOs.Responses;
using KLL.Store.Application.Queries;
using KLL.Store.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace KLL.Store.Application.Handlers;

public class GetProductsHandler : IRequestHandler<GetProductsQuery, IReadOnlyList<ProductResponse>>
{
    private readonly IProductRepository _repo;
    private readonly IDistributedCache _cache;

    public GetProductsHandler(IProductRepository repo, IDistributedCache cache) { _repo = repo; _cache = cache; }

    public async Task<IReadOnlyList<ProductResponse>> Handle(GetProductsQuery query, CancellationToken ct)
    {
        var cacheKey = $"products:{query.Category ?? "all"}";
        var cached = await _cache.GetStringAsync(cacheKey, ct);
        if (cached != null) return JsonSerializer.Deserialize<List<ProductResponse>>(cached)!;

        var products = query.Category != null
            ? await _repo.GetByCategoryAsync(query.Category, ct)
            : await _repo.GetAllAsync(ct);

        var result = products.Select(p => new ProductResponse(
            p.Id, p.Name, p.Description, p.Price.Amount,
            p.StockQuantity, p.Category, p.ImageUrl, p.IsActive, p.CreatedAt)).ToList();

        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5) }, ct);

        return result;
    }
}

public class GetProductByIdHandler : IRequestHandler<GetProductByIdQuery, ProductResponse?>
{
    private readonly IProductRepository _repo;
    public GetProductByIdHandler(IProductRepository repo) => _repo = repo;

    public async Task<ProductResponse?> Handle(GetProductByIdQuery query, CancellationToken ct)
    {
        var p = await _repo.GetByIdAsync(query.Id, ct);
        return p == null ? null : new ProductResponse(p.Id, p.Name, p.Description,
            p.Price.Amount, p.StockQuantity, p.Category, p.ImageUrl, p.IsActive, p.CreatedAt);
    }
}

public class SearchProductsHandler : IRequestHandler<SearchProductsQuery, IReadOnlyList<ProductResponse>>
{
    private readonly IProductRepository _repo;
    public SearchProductsHandler(IProductRepository repo) => _repo = repo;

    public async Task<IReadOnlyList<ProductResponse>> Handle(SearchProductsQuery query, CancellationToken ct)
    {
        var products = await _repo.SearchAsync(query.Query, ct);
        return products.Select(p => new ProductResponse(p.Id, p.Name, p.Description,
            p.Price.Amount, p.StockQuantity, p.Category, p.ImageUrl, p.IsActive, p.CreatedAt)).ToList();
    }
}