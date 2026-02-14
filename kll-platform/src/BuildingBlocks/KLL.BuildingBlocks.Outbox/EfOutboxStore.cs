using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace KLL.BuildingBlocks.Outbox;

/// <summary>
/// Generic EF-based Outbox store. Requires OutboxMessage DbSet in the service's DbContext.
/// Register with any DbContext that has DbSet<OutboxMessage> OutboxMessages.
/// </summary>
public class EfOutboxStore : IOutboxStore
{
    private readonly DbContext _db;

    public EfOutboxStore(IServiceProvider sp)
    {
        // Resolve the first available DbContext
        _db = sp.GetRequiredService<DbContext>();
    }

    public async Task AddAsync(OutboxMessage message, CancellationToken ct = default)
    {
        await _db.Set<OutboxMessage>().AddAsync(message, ct);
        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<OutboxMessage>> GetUnprocessedAsync(int batchSize = 20, CancellationToken ct = default)
    {
        return await _db.Set<OutboxMessage>()
            .Where(m => m.ProcessedOn == null && m.RetryCount < 5)
            .OrderBy(m => m.OccurredOn)
            .Take(batchSize)
            .ToListAsync(ct);
    }

    public async Task MarkAsProcessedAsync(Guid id, CancellationToken ct = default)
    {
        var msg = await _db.Set<OutboxMessage>().FindAsync(new object[] { id }, ct);
        if (msg != null)
        {
            msg.ProcessedOn = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }
    }

    public async Task MarkAsFailedAsync(Guid id, string error, CancellationToken ct = default)
    {
        var msg = await _db.Set<OutboxMessage>().FindAsync(new object[] { id }, ct);
        if (msg != null)
        {
            msg.Error = error;
            msg.RetryCount++;
            await _db.SaveChangesAsync(ct);
        }
    }
}