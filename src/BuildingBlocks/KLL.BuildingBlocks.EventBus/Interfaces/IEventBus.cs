namespace KLL.BuildingBlocks.EventBus.Interfaces;

public interface IEventBus
{
    Task PublishAsync<T>(T @event, CancellationToken ct = default) where T : class;
    Task PublishAsync(string topic, string message, string? key = null, CancellationToken ct = default);
}