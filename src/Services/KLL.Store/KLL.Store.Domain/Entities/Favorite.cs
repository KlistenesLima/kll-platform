using KLL.BuildingBlocks.Domain.Entities;

namespace KLL.Store.Domain.Entities;

public class Favorite : BaseEntity
{
    public string CustomerId { get; private set; } = string.Empty;
    public Guid ProductId { get; private set; }

    private Favorite() { }

    public static Favorite Create(string customerId, Guid productId)
    {
        var favorite = new Favorite
        {
            CustomerId = customerId,
            ProductId = productId
        };
        favorite.SetUpdated();
        return favorite;
    }
}
