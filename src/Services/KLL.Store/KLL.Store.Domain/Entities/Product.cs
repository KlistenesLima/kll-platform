using KLL.BuildingBlocks.Domain.Entities;

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

    public void Update(string name, string description, decimal price, int stockQuantity, string category, Guid? categoryId = null, string? imageUrl = null)
    {
        Name = name;
        Description = description;
        Price = price;
        StockQuantity = stockQuantity;
        Category = category;
        CategoryId = categoryId;
        ImageUrl = imageUrl;
    }

    public bool DeductStock(int quantity)
    {
        if (StockQuantity < quantity) return false;
        StockQuantity -= quantity;
        return true;
    }

    public void RestoreStock(int quantity) => StockQuantity += quantity;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
