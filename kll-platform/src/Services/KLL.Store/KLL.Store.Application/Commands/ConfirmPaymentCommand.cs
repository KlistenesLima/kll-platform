using KLL.BuildingBlocks.Domain.Results;
using MediatR;

namespace KLL.Store.Application.Commands;

public record ConfirmPaymentCommand(Guid OrderId, string ChargeId) : IRequest<Result>;