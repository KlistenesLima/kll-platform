using KLL.BuildingBlocks.Domain.Entities;
using KLL.Store.Domain.Events;

namespace KLL.Store.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public int StockQuantity { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public Guid? CategoryId { get; private set; }
    public Category? CategoryNav { get; private set; }
    public string? ImageUrl { get; private set; }
    public bool IsActive { get; private set; } = true;

    protected Product() { }

    public Product(string name, string description, decimal price, int stockQuantity, string category, Guid? categoryId = null, string? imageUrl = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        Description = description;
        Price = price;
        StockQuantity = stockQuantity;
        Category = category;
        CategoryId = categoryId;
        ImageUrl = imageUrl;
        CreatedAt = DateTime.UtcNow;
    }

    public static Product Create(string name, string description, decimal price, int stockQuantity, string category, Guid? categoryId = null, string? imageUrl = null)
    {
        var product = new Product(name, description, price, stockQuantity, category, categoryId, imageUrl);
        product.AddDomainEvent(new ProductCreatedEvent(product.Id, name, price));
        return product;
    }

    public void Update(string name, string description, decimal price, int stockQuantity, string category, Guid? categoryId = null, string? imageUrl = null)
    {
        Name = name;
        Description = description;
        Price = price;
        StockQuantity = stockQuantity;
        Category = category;
        CategoryId = categoryId;
        ImageUrl = imageUrl;
        SetUpdated();
    }

    public void DeductStock(int quantity)
    {
        if (StockQuantity < quantity)
            throw new InvalidOperationException($"Insufficient stock. Available: {StockQuantity}, Requested: {quantity}");
        StockQuantity -= quantity;
        AddDomainEvent(new ProductStockDeductedEvent(Id, quantity, StockQuantity));
    }

    public void RestoreStock(int quantity) => StockQuantity += quantity;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
