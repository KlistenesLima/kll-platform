namespace KLL.BuildingBlocks.Outbox;

public interface IOutboxStore
{
    Task AddAsync(OutboxMessage message, CancellationToken ct = default);
    Task<IReadOnlyList<OutboxMessage>> GetUnprocessedAsync(int batchSize = 20, CancellationToken ct = default);
    Task MarkAsProcessedAsync(Guid id, CancellationToken ct = default);
    Task MarkAsFailedAsync(Guid id, string error, CancellationToken ct = default);
}