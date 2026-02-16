using KLL.BuildingBlocks.Domain.Entities;

namespace KLL.Store.Domain.Entities;

public class Cart : BaseEntity
{
    public string CustomerId { get; private set; } = string.Empty;
    public ICollection<CartItem> Items { get; private set; } = new List<CartItem>();
    public new DateTime UpdatedAt { get; private set; }

    protected Cart() { }

    public Cart(string customerId)
    {
        Id = Guid.NewGuid();
        CustomerId = customerId;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddItem(Guid productId, string productName, decimal unitPrice, int quantity, string? imageUrl = null)
    {
        var existing = Items.FirstOrDefault(i => i.ProductId == productId);
        if (existing is not null)
            existing.UpdateQuantity(existing.Quantity + quantity);
        else
            Items.Add(new CartItem(Id, productId, productName, unitPrice, quantity, imageUrl));
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateItemQuantity(Guid productId, int quantity)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item is null) return;
        if (quantity <= 0) Items.Remove(item);
        else item.UpdateQuantity(quantity);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(Guid productId)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item is not null) { Items.Remove(item); UpdatedAt = DateTime.UtcNow; }
    }

    public void Clear() { Items.Clear(); UpdatedAt = DateTime.UtcNow; }
    public decimal Total => Items.Sum(i => i.Total);
    public int ItemCount => Items.Sum(i => i.Quantity);
}

public class CartItem : BaseEntity
{
    public Guid CartId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public string? ImageUrl { get; private set; }

    protected CartItem() { }

    public CartItem(Guid cartId, Guid productId, string productName, decimal unitPrice, int quantity, string? imageUrl)
    {
        Id = Guid.NewGuid();
        CartId = cartId;
        ProductId = productId;
        ProductName = productName;
        UnitPrice = unitPrice;
        Quantity = quantity;
        ImageUrl = imageUrl;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateQuantity(int quantity) => Quantity = quantity;
    public decimal Total => UnitPrice * Quantity;
}
