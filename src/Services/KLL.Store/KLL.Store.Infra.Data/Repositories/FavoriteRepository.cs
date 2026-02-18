using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly StoreDbContext _db;
    public FavoriteRepository(StoreDbContext db) => _db = db;

    public async Task<List<Favorite>> GetByCustomerIdAsync(string customerId, CancellationToken ct = default)
        => await _db.Favorites.Where(f => f.CustomerId == customerId).OrderByDescending(f => f.CreatedAt).ToListAsync(ct);

    public async Task<Favorite?> GetAsync(string customerId, Guid productId, CancellationToken ct = default)
        => await _db.Favorites.FirstOrDefaultAsync(f => f.CustomerId == customerId && f.ProductId == productId, ct);

    public async Task<bool> ExistsAsync(string customerId, Guid productId, CancellationToken ct = default)
        => await _db.Favorites.AnyAsync(f => f.CustomerId == customerId && f.ProductId == productId, ct);

    public async Task<List<Guid>> GetProductIdsAsync(string customerId, CancellationToken ct = default)
        => await _db.Favorites.Where(f => f.CustomerId == customerId).Select(f => f.ProductId).ToListAsync(ct);

    public async Task AddAsync(Favorite favorite, CancellationToken ct = default)
        => await _db.Favorites.AddAsync(favorite, ct);

    public void Delete(Favorite favorite) => _db.Favorites.Remove(favorite);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _db.SaveChangesAsync(ct);
}
