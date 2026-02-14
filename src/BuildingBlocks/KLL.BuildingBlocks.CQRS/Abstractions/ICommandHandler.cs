using MediatR;

namespace KLL.BuildingBlocks.CQRS.Abstractions;

public interface ICommandHandler<in TCommand> : IRequestHandler<TCommand, Result<Unit>>
    where TCommand : ICommand { }

public interface ICommandHandler<in TCommand, TResponse> : IRequestHandler<TCommand, Result<TResponse>>
    where TCommand : ICommand<TResponse> { }
