using MediatR;

namespace KLL.BuildingBlocks.CQRS.Abstractions;

public interface IQuery<out TResponse> : IRequest<Result<TResponse>> { }