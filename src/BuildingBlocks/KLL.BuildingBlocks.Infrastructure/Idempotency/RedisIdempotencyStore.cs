using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

namespace KLL.BuildingBlocks.Infrastructure.Idempotency;

public class RedisIdempotencyStore : IIdempotencyStore
{
    private readonly IDistributedCache _cache;
    private const string Prefix = "idempotency:";

    public RedisIdempotencyStore(IDistributedCache cache) => _cache = cache;

    public async Task<IdempotencyKey?> GetAsync(string key, CancellationToken ct = default)
    {
        var data = await _cache.GetStringAsync($"{Prefix}{key}", ct);
        return data == null ? null : JsonSerializer.Deserialize<IdempotencyKey>(data);
    }

    public async Task SaveAsync(IdempotencyKey entry, CancellationToken ct = default)
    {
        var json = JsonSerializer.Serialize(entry);
        await _cache.SetStringAsync($"{Prefix}{entry.Key}", json,
            new DistributedCacheEntryOptions { AbsoluteExpiration = entry.ExpiresAt }, ct);
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken ct = default)
        => await _cache.GetStringAsync($"{Prefix}{key}", ct) != null;
}
