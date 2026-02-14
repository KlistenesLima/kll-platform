using KLL.Store.Application.DTOs.Responses;
using KLL.Store.Application.Queries;
using KLL.Store.Domain.Interfaces;
using MediatR;

namespace KLL.Store.Application.Handlers;

public class GetOrderByIdHandler : IRequestHandler<GetOrderByIdQuery, OrderResponse?>
{
    private readonly IOrderRepository _repo;
    public GetOrderByIdHandler(IOrderRepository repo) => _repo = repo;

    public async Task<OrderResponse?> Handle(GetOrderByIdQuery query, CancellationToken ct)
    {
        var o = await _repo.GetWithItemsAsync(query.Id, ct);
        if (o == null) return null;
        return new OrderResponse(o.Id, o.CustomerId, o.Status.ToString(), o.TotalAmount.Amount,
            o.TrackingCode, o.CreatedAt,
            o.Items.Select(i => new OrderItemResponse(i.ProductId, i.ProductName, i.UnitPrice, i.Quantity, i.Total)).ToList());
    }
}

public class GetOrdersByCustomerHandler : IRequestHandler<GetOrdersByCustomerQuery, IReadOnlyList<OrderResponse>>
{
    private readonly IOrderRepository _repo;
    public GetOrdersByCustomerHandler(IOrderRepository repo) => _repo = repo;

    public async Task<IReadOnlyList<OrderResponse>> Handle(GetOrdersByCustomerQuery query, CancellationToken ct)
    {
        var orders = await _repo.GetByCustomerIdAsync(query.CustomerId, ct);
        return orders.Select(o => new OrderResponse(o.Id, o.CustomerId, o.Status.ToString(), o.TotalAmount.Amount,
            o.TrackingCode, o.CreatedAt,
            o.Items.Select(i => new OrderItemResponse(i.ProductId, i.ProductName, i.UnitPrice, i.Quantity, i.Total)).ToList())).ToList();
    }
}