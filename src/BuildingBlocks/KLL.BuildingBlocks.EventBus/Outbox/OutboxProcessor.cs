using System.Text.Json;
using KLL.BuildingBlocks.Domain.Outbox;
using KLL.BuildingBlocks.EventBus.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace KLL.BuildingBlocks.EventBus.Outbox;

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
                var outboxRepo = scope.ServiceProvider.GetRequiredService<IOutboxRepository>();
                var eventBus = scope.ServiceProvider.GetRequiredService<IEventBus>();

                var messages = await outboxRepo.GetPendingAsync(20, ct);
                foreach (var msg in messages)
                {
                    try
                    {
                        var topic = msg.Type.Replace("IntegrationEvent", "").Replace("Event", "").ToLowerInvariant();
                        await eventBus.PublishAsync(topic, msg.Content, msg.Id.ToString(), ct);
                        await outboxRepo.MarkAsProcessedAsync(msg.Id, ct);
                        _logger.LogInformation("Outbox message {Id} processed â†’ {Topic}", msg.Id, topic);
                    }
                    catch (Exception ex)
                    {
                        await outboxRepo.MarkAsFailedAsync(msg.Id, ex.Message, ct);
                        _logger.LogError(ex, "Outbox message {Id} failed", msg.Id);
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