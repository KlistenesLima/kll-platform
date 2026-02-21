using KLL.BuildingBlocks.CQRS.Abstractions;

namespace KLL.Store.Application.Commands.CancelOrder;

public record CancelOrderCommand(Guid OrderId, string? Reason) : ICommand;
