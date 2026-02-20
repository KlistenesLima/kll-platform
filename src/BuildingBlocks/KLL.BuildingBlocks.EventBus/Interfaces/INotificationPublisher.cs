namespace KLL.BuildingBlocks.EventBus.Interfaces;

public interface INotificationPublisher
{
    Task PublishAsync(string queue, object message, byte priority = 0, CancellationToken ct = default);
}
