using MediatR;

namespace KLL.BuildingBlocks.CQRS.Abstractions;

public interface ICommandHandler<in TCommand, TResponse> : IRequestHandler<TCommand, Result<TResponse>>
    where TCommand : ICommand<TResponse> { }