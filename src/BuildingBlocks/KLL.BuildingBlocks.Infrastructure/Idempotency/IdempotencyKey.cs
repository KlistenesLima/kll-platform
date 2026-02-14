namespace KLL.BuildingBlocks.Infrastructure.Idempotency;

public class IdempotencyKey
{
    public string Key { get; set; } = string.Empty;
    public string RequestType { get; set; } = string.Empty;
    public string ResponseBody { get; set; } = string.Empty;
    public int ResponseStatusCode { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);
}