using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.Store.Application.DTOs.Responses;

namespace KLL.Store.Application.Queries.GetOrdersByCustomer;

public record GetOrdersByCustomerQuery(string CustomerId) : IQuery<List<OrderResponse>>;
