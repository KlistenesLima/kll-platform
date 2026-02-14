using KLL.BuildingBlocks.EventBus.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace KLL.BuildingBlocks.Outbox;

public class OutboxProcessor : BackgroundService
{
    private readonly IServiceProvider _sp;
    private readonly ILogger<OutboxProcessor> _logger;

    public OutboxProcessor(IServiceProvider sp, ILogger<OutboxProcessor> logger)
    { _sp = sp; _logger = logger; }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        _logger.LogInformation("OutboxProcessor started");

        while (!ct.IsCancellationRequested)
        {
            try
            {
                using var scope = _sp.CreateScope();
                var outbox = scope.ServiceProvider.GetRequiredService<IOutboxStore>();
                var eventBus = scope.ServiceProvider.GetRequiredService<IEventBus>();

                var messages = await outbox.GetUnprocessedAsync(20, ct);

                foreach (var msg in messages)
                {
                    try
                    {
                        string topic = msg.Type;
                        string content = msg.Content;
                        await eventBus.PublishAsync(topic, content, null, ct);
                        await outbox.MarkAsProcessedAsync(msg.Id, ct);
                        _logger.LogInformation("Outbox message {Id} ({Type}) published", msg.Id, msg.Type);
                    }
                    catch (Exception ex)
                    {
                        await outbox.MarkAsFailedAsync(msg.Id, ex.Message, ct);
                        _logger.LogError(ex, "Failed to process outbox message {Id}", msg.Id);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OutboxProcessor error");
            }

            await Task.Delay(2000, ct);
        }
    }
}
