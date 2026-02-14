using KLL.Store.Application.DTOs.Responses;
using MediatR;

namespace KLL.Store.Application.Queries;

public record GetProductsQuery(string? Category = null) : IRequest<IReadOnlyList<ProductResponse>>;
public record GetProductByIdQuery(Guid Id) : IRequest<ProductResponse?>;
public record SearchProductsQuery(string Query) : IRequest<IReadOnlyList<ProductResponse>>;
public record GetOrderByIdQuery(Guid Id) : IRequest<OrderResponse?>;
public record GetOrdersByCustomerQuery(string CustomerId) : IRequest<IReadOnlyList<OrderResponse>>;