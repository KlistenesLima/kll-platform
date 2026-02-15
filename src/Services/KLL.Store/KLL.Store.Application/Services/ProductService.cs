using KLL.Store.Application.DTOs.Requests;
using KLL.Store.Application.DTOs.Responses;
using KLL.Store.Application.Interfaces;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;

namespace KLL.Store.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repo;
    public ProductService(IProductRepository repo) => _repo = repo;

    public async Task<ProductResponse> CreateAsync(CreateProductRequest req, CancellationToken ct)
    {
        var product = Product.Create(req.Name, req.Description, req.Price, req.StockQuantity, req.Category, req.ImageUrl);
        await _repo.AddAsync(product, ct);
        await _repo.SaveChangesAsync(ct);
        return Map(product);
    }

    public async Task<ProductResponse?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var p = await _repo.GetByIdAsync(id, ct);
        return p is null ? null : Map(p);
    }

    public async Task<IEnumerable<ProductResponse>> GetAllAsync(CancellationToken ct)
    {
        var products = await _repo.GetAllAsync(ct);
        return products.Select(Map);
    }

    public async Task<IEnumerable<ProductResponse>> SearchAsync(string term, CancellationToken ct)
    {
        var products = await _repo.SearchAsync(term, ct);
        return products.Select(Map);
    }

    public async Task<ProductResponse> UpdateAsync(Guid id, UpdateProductRequest req, CancellationToken ct)
    {
        var p = await _repo.GetByIdAsync(id, ct) ?? throw new KeyNotFoundException($"Product {id} not found");
        p.Update(req.Name, req.Description, req.Price, req.Category, req.ImageUrl);
        await _repo.UpdateAsync(p, ct);
        await _repo.SaveChangesAsync(ct);
        return Map(p);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct)
    {
        await _repo.DeleteAsync(id, ct);
        await _repo.SaveChangesAsync(ct);
    }

    private static ProductResponse Map(Product p) => new(p.Id, p.Name, p.Description,
        p.Price.Amount, p.StockQuantity, p.Category, p.ImageUrl, p.IsActive, p.CreatedAt);
}
