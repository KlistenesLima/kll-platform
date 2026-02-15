namespace KLL.BuildingBlocks.Domain.Outbox;

public class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime OccurredOn { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedOn { get; set; }
    public string? Error { get; set; }
    public int RetryCount { get; set; }

    public static OutboxMessage Create(string type, string content) => new()
    {
        Type = type,
        Content = content,
        OccurredOn = DateTime.UtcNow
    };
}
