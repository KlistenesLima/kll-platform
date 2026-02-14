namespace KLL.Store.Application.DTOs.Responses;

public record ProductResponse(
    Guid Id, string Name, string Description, decimal Price, int StockQuantity,
    string Category, string? ImageUrl, bool IsActive, DateTime CreatedAt);
