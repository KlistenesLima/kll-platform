using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.Store.Application.DTOs.Responses;

namespace KLL.Store.Application.Queries.GetOrderById;

public record GetOrderByIdQuery(Guid OrderId) : IQuery<OrderResponse>;
