namespace KLL.BuildingBlocks.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; protected set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; protected set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; protected set; }

    private readonly List<Events.DomainEvent> _domainEvents = new();
    public IReadOnlyCollection<Events.DomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void AddDomainEvent(Events.DomainEvent domainEvent) => _domainEvents.Add(domainEvent);
    public void ClearDomainEvents() => _domainEvents.Clear();
    protected void SetUpdated() => UpdatedAt = DateTime.UtcNow;
}

public abstract class AggregateRoot : BaseEntity
{
    public int Version { get; protected set; }
    protected void IncrementVersion() => Version++;
}
