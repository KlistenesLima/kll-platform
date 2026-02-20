using KLL.BuildingBlocks.Domain.Results;
using MediatR;

namespace KLL.BuildingBlocks.CQRS.Abstractions;

public interface ICommand : IRequest<Result> { }
public interface ICommand<TResponse> : IRequest<Result<TResponse>> { }
