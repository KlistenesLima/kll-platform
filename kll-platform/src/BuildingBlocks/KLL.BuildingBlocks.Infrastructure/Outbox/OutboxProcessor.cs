using System.Text.Json;
using KLL.BuildingBlocks.Domain.Events;
using KLL.BuildingBlocks.EventBus.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace KLL.BuildingBlocks.Infrastructure.Outbox;

public class OutboxProcessor<TContext> : BackgroundService where TContext : DbContext
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OutboxProcessor<TContext>> _logger;
    private readonly TimeSpan _pollingInterval = TimeSpan.FromSeconds(5);

    public OutboxProcessor(IServiceScopeFactory scopeFactory, ILogger<OutboxProcessor<TContext>> logger)
    { _scopeFactory = scopeFactory; _logger = logger; }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        _logger.LogInformation("OutboxProcessor<{Context}> started", typeof(TContext).Name);

        while (!ct.IsCancellationRequested)
        {
            try
            {
                await ProcessMessagesAsync(ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OutboxProcessor");
            }
            await Task.Delay(_pollingInterval, ct);
        }
    }

    private async Task ProcessMessagesAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TContext>();
        var eventBus = scope.ServiceProvider.GetRequiredService<IEventBus>();

        var messages = await db.Set<OutboxMessage>()
            .Where(m => m.ProcessedOn == null && m.RetryCount < 3)
            .OrderBy(m => m.OccurredOn)
            .Take(100)
            .ToListAsync(ct);

        if (messages.Count == 0) return;

        foreach (var msg in messages)
        {
            try
            {
                var eventType = AppDomain.CurrentDomain.GetAssemblies()
                    .SelectMany(a => { try { return a.GetTypes(); } catch { return []; } })
                    .FirstOrDefault(t => t.FullName == msg.Type || t.Name == msg.Type);

                if (eventType == null)
                {
                    _logger.LogWarning("Unknown event type: {Type}", msg.Type);
                    msg.RetryCount = 3; // skip
                    continue;
                }

                var @event = JsonSerializer.Deserialize(msg.Content, eventType,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (@event is IntegrationEvent ie)
                {
                    await eventBus.PublishAsync(ie, ct);
                    msg.ProcessedOn = DateTime.UtcNow;
                    _logger.LogInformation("Outbox: Published {Type} [{Id}]", msg.Type, msg.Id);
                }
            }
            catch (Exception ex)
            {
                msg.RetryCount++;
                msg.Error = ex.Message;
                _logger.LogError(ex, "Outbox: Failed to process {Id} (attempt {Retry})", msg.Id, msg.RetryCount);
            }
        }

        await db.SaveChangesAsync(ct);
    }
}