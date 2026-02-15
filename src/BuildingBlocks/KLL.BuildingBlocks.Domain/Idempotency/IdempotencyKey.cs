namespace KLL.BuildingBlocks.Domain.Idempotency;

public class IdempotencyKey
{
    public string Key { get; set; } = string.Empty;
    public string RequestHash { get; set; } = string.Empty;
    public string? ResponseBody { get; set; }
    public int StatusCode { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }

    public static IdempotencyKey Create(string key, string requestHash, TimeSpan? ttl = null) => new()
    {
        Key = key,
        RequestHash = requestHash,
        ExpiresAt = DateTime.UtcNow.Add(ttl ?? TimeSpan.FromHours(24))
    };
}
