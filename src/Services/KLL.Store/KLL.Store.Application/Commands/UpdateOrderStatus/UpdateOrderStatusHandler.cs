using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.BuildingBlocks.Domain.Results;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace KLL.Store.Application.Commands.UpdateOrderStatus;

public class UpdateOrderStatusHandler : ICommandHandler<UpdateOrderStatusCommand>
{
    private readonly IOrderRepository _repo;
    private readonly ILogger<UpdateOrderStatusHandler> _logger;

    public UpdateOrderStatusHandler(IOrderRepository repo, ILogger<UpdateOrderStatusHandler> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateOrderStatusCommand cmd, CancellationToken ct)
    {
        var order = await _repo.GetWithItemsAsync(cmd.OrderId, ct);
        if (order is null) return Result.Failure("Order not found");

        if (!Enum.TryParse<OrderStatus>(cmd.Status, true, out var newStatus))
            return Result.Failure($"Invalid status: {cmd.Status}");

        switch (newStatus)
        {
            case OrderStatus.Paid:
                order.ConfirmPayment("admin-manual");
                break;
            case OrderStatus.Shipped:
                var trackingCode = $"AU{DateTime.UtcNow:yyyyMMdd}{Guid.NewGuid().ToString()[..5].ToUpper()}";
                order.SetShipped(trackingCode);
                break;
            case OrderStatus.Delivered:
                order.SetDelivered();
                break;
            case OrderStatus.Cancelled:
                order.Cancel();
                break;
            default:
                return Result.Failure($"Cannot manually set status to {cmd.Status}");
        }

        await _repo.UpdateAsync(order, ct);
        await _repo.SaveChangesAsync(ct);

        _logger.LogInformation("Order {OrderId} status updated to {Status}", cmd.OrderId, newStatus);
        return Result.Success();
    }
}
