using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.BuildingBlocks.Domain.Results;
using KLL.Store.Application.DTOs.Responses;
using KLL.Store.Domain.Interfaces;

namespace KLL.Store.Application.Queries.GetAllOrders;

public class GetAllOrdersHandler : IQueryHandler<GetAllOrdersQuery, List<OrderResponse>>
{
    private readonly IOrderRepository _repository;

    public GetAllOrdersHandler(IOrderRepository repository) => _repository = repository;

    public async Task<Result<List<OrderResponse>>> Handle(GetAllOrdersQuery query, CancellationToken ct)
    {
        var orders = await _repository.GetAllAsync(ct);
        var result = orders.Select(o => new OrderResponse(
            o.Id, o.CustomerId, o.Status.ToString(), o.TotalAmount.Amount,
            o.TrackingCode, o.CreatedAt,
            o.Items.Select(i => new OrderItemResponse(i.ProductId, i.ProductName, i.UnitPrice, i.Quantity)).ToList()
        )).OrderByDescending(o => o.CreatedAt).ToList();
        return Result.Success(result);
    }
}
