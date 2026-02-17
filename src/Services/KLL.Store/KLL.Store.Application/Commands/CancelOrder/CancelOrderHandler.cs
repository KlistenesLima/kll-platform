using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.BuildingBlocks.Domain.Results;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace KLL.Store.Application.Commands.CancelOrder;

public class CancelOrderHandler : ICommandHandler<CancelOrderCommand>
{
    private readonly IOrderRepository _repo;
    private readonly ILogger<CancelOrderHandler> _logger;

    public CancelOrderHandler(IOrderRepository repo, ILogger<CancelOrderHandler> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task<Result> Handle(CancelOrderCommand cmd, CancellationToken ct)
    {
        var order = await _repo.GetWithItemsAsync(cmd.OrderId, ct);
        if (order is null) return Result.Failure("Order not found");

        if (order.Status is not (OrderStatus.Pending or OrderStatus.Paid))
            return Result.Failure("Only pending or paid orders can be cancelled");

        order.Cancel();
        await _repo.UpdateAsync(order, ct);
        await _repo.SaveChangesAsync(ct);

        _logger.LogInformation("Order {OrderId} cancelled. Reason: {Reason}", cmd.OrderId, cmd.Reason ?? "No reason provided");
        return Result.Success();
    }
}
