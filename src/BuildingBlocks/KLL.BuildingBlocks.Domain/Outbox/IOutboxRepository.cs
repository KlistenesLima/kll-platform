namespace KLL.BuildingBlocks.Domain.Outbox;

public interface IOutboxRepository
{
    Task AddAsync(OutboxMessage message, CancellationToken ct = default);
    Task<IReadOnlyList<OutboxMessage>> GetPendingAsync(int batchSize = 20, CancellationToken ct = default);
    Task MarkAsProcessedAsync(Guid id, CancellationToken ct = default);
    Task MarkAsFailedAsync(Guid id, string error, CancellationToken ct = default);
}
