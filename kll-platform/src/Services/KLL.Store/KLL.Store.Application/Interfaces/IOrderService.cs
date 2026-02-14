using KLL.Store.Application.DTOs.Requests;
using KLL.Store.Application.DTOs.Responses;

namespace KLL.Store.Application.Interfaces;

public interface IOrderService
{
    Task<OrderResponse> CreateAsync(CreateOrderRequest request, CancellationToken ct = default);
    Task<OrderResponse?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<OrderResponse>> GetByCustomerAsync(string customerId, CancellationToken ct = default);
    Task ConfirmPaymentAsync(Guid orderId, string chargeId, CancellationToken ct = default);
}