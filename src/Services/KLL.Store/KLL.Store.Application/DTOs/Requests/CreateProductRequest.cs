namespace KLL.Store.Application.DTOs.Requests;

public record CreateProductRequest(string Name, string Description, decimal Price, int StockQuantity, string Category, string? ImageUrl);
public record UpdateProductRequest(string Name, string Description, decimal Price, string Category, string? ImageUrl);
public record CreateOrderRequest(string CustomerId, string CustomerEmail, string Street, string Number,
    string? Complement, string Neighborhood, string City, string State, string ZipCode, List<OrderItemRequest> Items);
public record OrderItemRequest(Guid ProductId, int Quantity);
