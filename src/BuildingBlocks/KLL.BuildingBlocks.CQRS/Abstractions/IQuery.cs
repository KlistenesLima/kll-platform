using MediatR;

namespace KLL.BuildingBlocks.CQRS.Abstractions;

public interface IQuery<TResponse> : IRequest<Result<TResponse>> { }
