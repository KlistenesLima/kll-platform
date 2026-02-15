using KLL.Pay.Domain.Entities;
using KLL.Pay.Domain.Interfaces;
using KLL.Pay.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Pay.Infra.Data.Repositories;

public class MerchantRepository : IMerchantRepository
{
    private readonly PayDbContext _ctx;
    public MerchantRepository(PayDbContext ctx) => _ctx = ctx;
    public async Task<Merchant?> GetByIdAsync(Guid id, CancellationToken ct) => await _ctx.Merchants.FindAsync(new object[] { id }, ct);
    public async Task<IEnumerable<Merchant>> GetAllAsync(CancellationToken ct) => await _ctx.Merchants.ToListAsync(ct);
    public async Task<Merchant> AddAsync(Merchant entity, CancellationToken ct) { await _ctx.Merchants.AddAsync(entity, ct); return entity; }
    public Task UpdateAsync(Merchant entity, CancellationToken ct) { _ctx.Merchants.Update(entity); return Task.CompletedTask; }
    public async Task DeleteAsync(Guid id, CancellationToken ct) { var m = await GetByIdAsync(id, ct); if (m != null) _ctx.Merchants.Remove(m); }
    public Task<int> SaveChangesAsync(CancellationToken ct) => _ctx.SaveChangesAsync(ct);
    public async Task<Merchant?> GetByApiKeyAsync(string apiKey, CancellationToken ct) => await _ctx.Merchants.FirstOrDefaultAsync(m => m.ApiKey == apiKey, ct);
}
