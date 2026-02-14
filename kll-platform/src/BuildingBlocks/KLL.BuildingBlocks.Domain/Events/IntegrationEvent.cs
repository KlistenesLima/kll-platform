namespace KLL.BuildingBlocks.Domain.Events;

public abstract class IntegrationEvent
{
    public Guid EventId { get; set; } = Guid.NewGuid();
    public DateTime OccurredOn { get; set; } = DateTime.UtcNow;
    public string EventType => GetType().Name;
    public string? CorrelationId { get; set; }
}