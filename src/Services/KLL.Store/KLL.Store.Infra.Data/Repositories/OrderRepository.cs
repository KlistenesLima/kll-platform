using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly StoreDbContext _ctx;
    public OrderRepository(StoreDbContext ctx) => _ctx = ctx;

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken ct) => await _ctx.Orders.FindAsync(new object[] { id }, ct);
    public async Task<IEnumerable<Order>> GetAllAsync(CancellationToken ct) => await _ctx.Orders.Include(o => o.Items).ToListAsync(ct);
    public async Task<Order> AddAsync(Order entity, CancellationToken ct) { await _ctx.Orders.AddAsync(entity, ct); return entity; }
    public Task UpdateAsync(Order entity, CancellationToken ct) { _ctx.Orders.Update(entity); return Task.CompletedTask; }
    public async Task DeleteAsync(Guid id, CancellationToken ct) { var o = await GetByIdAsync(id, ct); if (o != null) _ctx.Orders.Remove(o); }
    public Task<int> SaveChangesAsync(CancellationToken ct) => _ctx.SaveChangesAsync(ct);
    public async Task<IEnumerable<Order>> GetByCustomerIdAsync(string cid, CancellationToken ct) => await _ctx.Orders.Include(o => o.Items).Where(o => o.CustomerId == cid).ToListAsync(ct);
    public async Task<Order?> GetWithItemsAsync(Guid id, CancellationToken ct) => await _ctx.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id, ct);
}
