using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly StoreDbContext _ctx;
    public ProductRepository(StoreDbContext ctx) => _ctx = ctx;

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct) => await _ctx.Products.FindAsync(new object[] { id }, ct);
    public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken ct) => await _ctx.Products.Where(p => p.IsActive).ToListAsync(ct);
    public async Task<Product> AddAsync(Product entity, CancellationToken ct) { await _ctx.Products.AddAsync(entity, ct); return entity; }
    public Task UpdateAsync(Product entity, CancellationToken ct) { _ctx.Products.Update(entity); return Task.CompletedTask; }
    public async Task DeleteAsync(Guid id, CancellationToken ct) { var p = await GetByIdAsync(id, ct); if (p != null) _ctx.Products.Remove(p); }
    public Task<int> SaveChangesAsync(CancellationToken ct) => _ctx.SaveChangesAsync(ct);
    public async Task<IEnumerable<Product>> GetByCategoryAsync(string cat, CancellationToken ct) => await _ctx.Products.Where(p => p.Category == cat && p.IsActive).ToListAsync(ct);
    public async Task<IEnumerable<Product>> SearchAsync(string term, CancellationToken ct) => await _ctx.Products.Where(p => p.Name.Contains(term) || p.Description.Contains(term)).ToListAsync(ct);
}
