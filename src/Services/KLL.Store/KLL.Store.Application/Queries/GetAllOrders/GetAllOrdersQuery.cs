using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.Store.Application.DTOs.Responses;

namespace KLL.Store.Application.Queries.GetAllOrders;

public record GetAllOrdersQuery : IQuery<List<OrderResponse>>;
