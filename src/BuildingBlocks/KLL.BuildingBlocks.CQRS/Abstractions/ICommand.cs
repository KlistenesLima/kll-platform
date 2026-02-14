using MediatR;

namespace KLL.BuildingBlocks.CQRS.Abstractions;

public interface ICommand : IRequest<Result<Unit>> { }
public interface ICommand<TResponse> : IRequest<Result<TResponse>> { }
