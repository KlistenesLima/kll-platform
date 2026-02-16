using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Repositories;

public class CartRepository : ICartRepository
{
    private readonly StoreDbContext _db;
    public CartRepository(StoreDbContext db) => _db = db;

    public async Task<Cart?> GetByCustomerIdAsync(string customerId, CancellationToken ct = default)
        => await _db.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.CustomerId == customerId, ct);

    public async Task AddAsync(Cart cart, CancellationToken ct = default)
        => await _db.Carts.AddAsync(cart, ct);

    public void Update(Cart cart) => _db.Carts.Update(cart);
    public void Delete(Cart cart) => _db.Carts.Remove(cart);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _db.SaveChangesAsync(ct);
}
