namespace KLL.BuildingBlocks.Domain.Interfaces;

public interface IMessageBusService
{
    Task PublishAsync<T>(string topic, T message, CancellationToken ct = default) where T : class;
    Task SubscribeAsync<T>(string topic, Func<T, Task> handler, CancellationToken ct = default) where T : class;
}
