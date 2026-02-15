namespace KLL.BuildingBlocks.Infrastructure.Idempotency;

public interface IIdempotencyStore
{
    Task<IdempotencyKey?> GetAsync(string key, CancellationToken ct = default);
    Task SaveAsync(IdempotencyKey entry, CancellationToken ct = default);
    Task<bool> ExistsAsync(string key, CancellationToken ct = default);
}
