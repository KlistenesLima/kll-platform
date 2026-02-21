using KLL.BuildingBlocks.CQRS.Abstractions;

namespace KLL.Store.Application.Commands.ConfirmPayment;

public record ConfirmPaymentCommand(Guid OrderId, string ChargeId) : ICommand;
