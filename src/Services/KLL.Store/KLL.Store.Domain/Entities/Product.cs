using KLL.BuildingBlocks.Domain.Entities;
using KLL.BuildingBlocks.Domain.ValueObjects;
using KLL.Store.Domain.Events;

namespace KLL.Store.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Money Price { get; private set; } = Money.Zero();
    public int StockQuantity { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public string? ImageUrl { get; private set; }
    public bool IsActive { get; private set; } = true;

    private Product() { }

    public static Product Create(string name, string description, decimal price, int stock, string category, string? imageUrl = null)
    {
        var product = new Product
        {
            Name = name, Description = description,
            Price = new Money(price), StockQuantity = stock,
            Category = category, ImageUrl = imageUrl
        };
        product.AddDomainEvent(new ProductCreatedEvent(product.Id, name, price));
        return product;
    }

    public void UpdateStock(int quantity)
    {
        if (StockQuantity + quantity < 0) throw new InvalidOperationException("Insufficient stock");
        StockQuantity += quantity;
        SetUpdated();
    }

    public void DeductStock(int quantity)
    {
        if (quantity > StockQuantity) throw new InvalidOperationException($"Insufficient stock for {Name}");
        StockQuantity -= quantity;
        SetUpdated();
        AddDomainEvent(new ProductStockDeductedEvent(Id, quantity, StockQuantity));
    }

    public void Update(string name, string description, decimal price, string category, string? imageUrl)
    {
        Name = name; Description = description;
        Price = new Money(price); Category = category;
        ImageUrl = imageUrl; SetUpdated();
    }

    public void RestoreStock(int quantity)
    {
        StockQuantity += quantity;
        SetUpdated();
    }
}
