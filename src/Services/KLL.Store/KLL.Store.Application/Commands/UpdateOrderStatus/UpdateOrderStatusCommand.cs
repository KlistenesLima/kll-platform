using KLL.BuildingBlocks.CQRS.Abstractions;

namespace KLL.Store.Application.Commands.UpdateOrderStatus;

public record UpdateOrderStatusCommand(Guid OrderId, string Status) : ICommand;
