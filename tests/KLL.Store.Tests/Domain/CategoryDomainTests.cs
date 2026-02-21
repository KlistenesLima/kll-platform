using FluentAssertions;
using KLL.Store.Domain.Entities;
using Xunit;

namespace KLL.Store.Tests.Domain;

public class CategoryDomainTests
{
    [Fact]
    public void Create_ShouldGenerateSlug()
    {
        var category = new Category("Electronics", "Electronic products");

        category.Name.Should().Be("Electronics");
        category.Slug.Should().Be("electronics");
        category.Description.Should().Be("Electronic products");
        category.IsActive.Should().BeTrue();
        category.ParentCategoryId.Should().BeNull();
        category.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void Create_WithParent_ShouldSetParentId()
    {
        var parentId = Guid.NewGuid();
        var category = new Category("Smartphones", "Celulares", null, parentId);

        category.ParentCategoryId.Should().Be(parentId);
        category.Name.Should().Be("Smartphones");
    }

    [Fact]
    public void Update_ShouldChangeProperties()
    {
        var category = new Category("Old Name", "Old Desc");

        category.Update("New Name", "New Desc", "https://img.com/new.jpg", 5);

        category.Name.Should().Be("New Name");
        category.Slug.Should().Be("new-name");
        category.Description.Should().Be("New Desc");
        category.ImageUrl.Should().Be("https://img.com/new.jpg");
        category.DisplayOrder.Should().Be(5);
    }

    [Fact]
    public void Deactivate_ShouldSetInactive()
    {
        var category = new Category("Test", "Test desc");

        category.Deactivate();

        category.IsActive.Should().BeFalse();
    }

    [Fact]
    public void Activate_ShouldSetActive()
    {
        var category = new Category("Test", "Test desc");
        category.Deactivate();

        category.Activate();

        category.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Slug_ShouldConvertToLowerAndReplaceSpaces()
    {
        var category = new Category("Hello World");

        category.Slug.Should().Be("hello-world");
    }

    [Fact]
    public void SubCategories_ShouldBeInitializedEmpty()
    {
        var category = new Category("Parent");

        category.SubCategories.Should().NotBeNull();
        category.SubCategories.Should().BeEmpty();
    }

    [Fact]
    public void Products_ShouldBeInitializedEmpty()
    {
        var category = new Category("Test");

        category.Products.Should().NotBeNull();
        category.Products.Should().BeEmpty();
    }
}
