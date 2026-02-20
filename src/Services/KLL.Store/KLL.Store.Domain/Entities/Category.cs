using KLL.BuildingBlocks.Domain.Entities;

namespace KLL.Store.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }
    public Guid? ParentCategoryId { get; private set; }
    public Category? ParentCategory { get; private set; }
    public ICollection<Category> SubCategories { get; private set; } = new List<Category>();
    public ICollection<Product> Products { get; private set; } = new List<Product>();
    public bool IsActive { get; private set; } = true;
    public int DisplayOrder { get; private set; }

    protected Category() { }

    public Category(string name, string? description = null, string? imageUrl = null, Guid? parentCategoryId = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        Slug = GenerateSlug(name);
        Description = description;
        ImageUrl = imageUrl;
        ParentCategoryId = parentCategoryId;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(string name, string? description, string? imageUrl, int displayOrder)
    {
        Name = name;
        Slug = GenerateSlug(name);
        Description = description;
        ImageUrl = imageUrl;
        DisplayOrder = displayOrder;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    private static string GenerateSlug(string name)
        => name.ToLowerInvariant()
            .Replace(" ", "-").Replace("Ã£", "a").Replace("Ã¡", "a").Replace("Ã¢", "a")
            .Replace("Ã©", "e").Replace("Ãª", "e").Replace("Ã­", "i")
            .Replace("Ã³", "o").Replace("Ã´", "o").Replace("Ãº", "u").Replace("Ã§", "c");
}
