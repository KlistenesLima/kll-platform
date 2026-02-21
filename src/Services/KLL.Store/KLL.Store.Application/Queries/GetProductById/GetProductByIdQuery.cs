using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.Store.Application.DTOs.Responses;

namespace KLL.Store.Application.Queries.GetProductById;

public record GetProductByIdQuery(Guid ProductId) : IQuery<ProductResponse>;
