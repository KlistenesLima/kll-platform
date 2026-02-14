using KLL.Pay.Domain.Entities;
using KLL.Pay.Domain.Interfaces;
using KLL.Pay.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Pay.Infra.Data.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly PayDbContext _ctx;
    public TransactionRepository(PayDbContext ctx) => _ctx = ctx;
    public async Task<Transaction?> GetByIdAsync(Guid id, CancellationToken ct) => await _ctx.Transactions.FindAsync(new object[] { id }, ct);
    public async Task<IEnumerable<Transaction>> GetAllAsync(CancellationToken ct) => await _ctx.Transactions.ToListAsync(ct);
    public async Task<Transaction> AddAsync(Transaction entity, CancellationToken ct) { await _ctx.Transactions.AddAsync(entity, ct); return entity; }
    public Task UpdateAsync(Transaction entity, CancellationToken ct) { _ctx.Transactions.Update(entity); return Task.CompletedTask; }
    public async Task DeleteAsync(Guid id, CancellationToken ct) { var t = await GetByIdAsync(id, ct); if (t != null) _ctx.Transactions.Remove(t); }
    public Task<int> SaveChangesAsync(CancellationToken ct) => _ctx.SaveChangesAsync(ct);
    public async Task<IEnumerable<Transaction>> GetByMerchantIdAsync(Guid mid, CancellationToken ct) => await _ctx.Transactions.Where(t => t.MerchantId == mid).OrderByDescending(t => t.CreatedAt).ToListAsync(ct);
}