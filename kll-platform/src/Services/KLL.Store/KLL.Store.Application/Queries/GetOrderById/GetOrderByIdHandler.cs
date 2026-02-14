using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.BuildingBlocks.Domain.Results;
using KLL.Store.Application.DTOs.Responses;
using KLL.Store.Domain.Interfaces;

namespace KLL.Store.Application.Queries.GetOrderById;

public class GetOrderByIdHandler : IQueryHandler<GetOrderByIdQuery, OrderResponse>
{
    private readonly IOrderRepository _repository;

    public GetOrderByIdHandler(IOrderRepository repository) => _repository = repository;

    public async Task<Result<OrderResponse>> Handle(GetOrderByIdQuery query, CancellationToken ct)
    {
        var order = await _repository.GetWithItemsAsync(query.OrderId, ct);
        if (order == null) return Result.Failure<OrderResponse>("Order not found");

        return Result.Success(new OrderResponse(
            order.Id, order.CustomerId, order.Status.ToString(), order.TotalAmount.Amount,
            order.TrackingCode, order.CreatedAt,
            order.Items.Select(i => new OrderItemResponse(i.ProductId, i.ProductName, i.UnitPrice, i.Quantity)).ToList()
        ));
    }
}