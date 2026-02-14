using MediatR;

namespace KLL.BuildingBlocks.CQRS.Abstractions;

public interface ICommand : ICommand<Unit> { }
public interface ICommand<out TResponse> : IRequest<Result<TResponse>> { }