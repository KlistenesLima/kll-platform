using KLL.BuildingBlocks.Domain.Outbox;
using Microsoft.EntityFrameworkCore;

namespace KLL.BuildingBlocks.Infrastructure.Persistence;

public class OutboxRepository : IOutboxRepository
{
    private readonly DbContext _context;

    public OutboxRepository(DbContext context) => _context = context;

    public async Task AddAsync(OutboxMessage message, CancellationToken ct = default)
    {
        await _context.Set<OutboxMessage>().AddAsync(message, ct);
        await _context.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<OutboxMessage>> GetPendingAsync(int batchSize = 20, CancellationToken ct = default)
    {
        return await _context.Set<OutboxMessage>()
            .Where(x => x.ProcessedOn == null && x.RetryCount < 5)
            .OrderBy(x => x.OccurredOn)
            .Take(batchSize)
            .ToListAsync(ct);
    }

    public async Task MarkAsProcessedAsync(Guid id, CancellationToken ct = default)
    {
        var msg = await _context.Set<OutboxMessage>().FindAsync(new object[] { id }, ct);
        if (msg != null) { msg.ProcessedOn = DateTime.UtcNow; await _context.SaveChangesAsync(ct); }
    }

    public async Task MarkAsFailedAsync(Guid id, string error, CancellationToken ct = default)
    {
        var msg = await _context.Set<OutboxMessage>().FindAsync(new object[] { id }, ct);
        if (msg != null) { msg.Error = error; msg.RetryCount++; await _context.SaveChangesAsync(ct); }
    }
}