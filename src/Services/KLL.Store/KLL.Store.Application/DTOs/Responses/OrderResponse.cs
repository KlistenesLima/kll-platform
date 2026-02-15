namespace KLL.Store.Application.DTOs.Responses;

public record OrderResponse(
    Guid Id, string CustomerId, string Status, decimal TotalAmount,
    string? TrackingCode, DateTime CreatedAt, List<OrderItemResponse> Items);

public record OrderItemResponse(Guid ProductId, string ProductName, decimal UnitPrice, int Quantity);
