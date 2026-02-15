using System.Text.Json;
using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.BuildingBlocks.Domain.Outbox;
using KLL.BuildingBlocks.Domain.Results;
using KLL.Store.Domain.Events;
using KLL.Store.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace KLL.Store.Application.Commands.ConfirmPayment;

public class ConfirmPaymentHandler : ICommandHandler<ConfirmPaymentCommand>
{
    private readonly IOrderRepository _repo;
    private readonly IOutboxRepository _outbox;
    private readonly ILogger<ConfirmPaymentHandler> _logger;

    public ConfirmPaymentHandler(IOrderRepository repo, IOutboxRepository outbox, ILogger<ConfirmPaymentHandler> logger)
    { _repo = repo; _outbox = outbox; _logger = logger; }

    public async Task<Result> Handle(ConfirmPaymentCommand cmd, CancellationToken ct)
    {
        var order = await _repo.GetByIdAsync(cmd.OrderId, ct);
        if (order == null) return Result.Failure("Order not found");

        order.ConfirmPayment(cmd.ChargeId);
        await _repo.UpdateAsync(order, ct);
        await _repo.SaveChangesAsync(ct);

        // Outbox: notify Logistics to create shipment
        var shipmentEvent = new ShipmentRequestedIntegrationEvent
        {
            OrderId = order.Id, RecipientName = order.CustomerId,
            RecipientEmail = order.CustomerEmail,
            Street = order.ShippingAddress!.Street, Number = order.ShippingAddress.Number,
            City = order.ShippingAddress.City, State = order.ShippingAddress.State,
            ZipCode = order.ShippingAddress.ZipCode, Weight = 1.0m
        };
        await _outbox.AddAsync(OutboxMessage.Create(
            nameof(ShipmentRequestedIntegrationEvent),
            JsonSerializer.Serialize(shipmentEvent)), ct);

        _logger.LogInformation("Order {OrderId} payment confirmed", cmd.OrderId);
        return Result.Success();
    }
}
