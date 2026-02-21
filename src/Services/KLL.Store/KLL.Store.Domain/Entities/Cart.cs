using KLL.BuildingBlocks.Domain.Entities;

namespace KLL.Store.Domain.Entities;

public class Cart : BaseEntity
{
    public string CustomerId { get; private set; } = string.Empty;
    public ICollection<CartItem> Items { get; private set; } = new List<CartItem>();

    protected Cart() { }

    public Cart(string customerId)
    {
        Id = Guid.NewGuid();
        CustomerId = customerId;
        CreatedAt = DateTime.UtcNow;
        SetUpdated();
    }

    /// <summary>
    /// Adds a product to the cart. Returns the new CartItem if created, or null if an existing item was updated.
    /// </summary>
    public CartItem? AddItem(Guid productId, string productName, decimal unitPrice, int quantity, string? imageUrl = null)
    {
        var existing = Items.FirstOrDefault(i => i.ProductId == productId);
        if (existing is not null)
        {
            existing.UpdateQuantity(existing.Quantity + quantity);
            SetUpdated();
            return null;
        }

        var item = new CartItem(Id, productId, productName, unitPrice, quantity, imageUrl);
        Items.Add(item);
        SetUpdated();
        return item;
    }

    public void UpdateItemQuantity(Guid productId, int quantity)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item is null) return;
        if (quantity <= 0) Items.Remove(item);
        else item.UpdateQuantity(quantity);
        SetUpdated();
    }

    public void RemoveItem(Guid productId)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item is not null) { Items.Remove(item); SetUpdated(); }
    }

    public void Clear() { Items.Clear(); SetUpdated(); }
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
