namespace KLL.BuildingBlocks.EventBus.Interfaces;

public interface INotificationBus
{
    Task PublishNotificationAsync(string queue, string message, CancellationToken ct = default);
}
