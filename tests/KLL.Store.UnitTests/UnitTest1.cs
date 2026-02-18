using FluentAssertions;
using KLL.Store.Domain.Entities;
using Xunit;

namespace KLL.Store.UnitTests;

public class FavoriteDomainTests
{
    [Fact]
    public void Create_ShouldSetCustomerIdAndProductId()
    {
        var productId = Guid.NewGuid();
        var favorite = Favorite.Create("user-123", productId);

        favorite.CustomerId.Should().Be("user-123");
        favorite.ProductId.Should().Be(productId);
        favorite.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void Create_DifferentProducts_ShouldHaveDifferentIds()
    {
        var fav1 = Favorite.Create("user-1", Guid.NewGuid());
        var fav2 = Favorite.Create("user-1", Guid.NewGuid());

        fav1.Id.Should().NotBe(fav2.Id);
        fav1.ProductId.Should().NotBe(fav2.ProductId);
    }

    [Fact]
    public void Create_ShouldSetCreatedAt()
    {
        var before = DateTime.UtcNow;
        var favorite = Favorite.Create("user-1", Guid.NewGuid());

        favorite.CreatedAt.Should().BeOnOrAfter(before);
    }
}

public class CustomerAddressDomainTests
{
    [Fact]
    public void Create_ShouldSetAllFields()
    {
        var addr = CustomerAddress.Create("user-1", "Casa", "Rua A", "123", "Apto 4",
            "Centro", "Recife", "PE", "50000-000");

        addr.CustomerId.Should().Be("user-1");
        addr.Label.Should().Be("Casa");
        addr.Street.Should().Be("Rua A");
        addr.Number.Should().Be("123");
        addr.Complement.Should().Be("Apto 4");
        addr.Neighborhood.Should().Be("Centro");
        addr.City.Should().Be("Recife");
        addr.State.Should().Be("PE");
        addr.ZipCode.Should().Be("50000-000");
        addr.IsDefault.Should().BeFalse();
        addr.Id.Should().NotBeEmpty();
    }

    [Fact]
    public void Create_WithoutComplement_ShouldAllowNull()
    {
        var addr = CustomerAddress.Create("user-1", "Trabalho", "Rua B", "456", null,
            "Boa Viagem", "Recife", "PE", "51000-000");

        addr.Complement.Should().BeNull();
        addr.IsDefault.Should().BeFalse();
    }

    [Fact]
    public void Update_ShouldChangeFields()
    {
        var addr = CustomerAddress.Create("user-1", "Casa", "Rua A", "123", null,
            "Centro", "Recife", "PE", "50000-000");

        addr.Update("Trabalho", "Rua Nova", "789", "Sala 2", "Boa Viagem", "Recife", "PE", "51000-000");

        addr.Label.Should().Be("Trabalho");
        addr.Street.Should().Be("Rua Nova");
        addr.Number.Should().Be("789");
        addr.Complement.Should().Be("Sala 2");
        addr.Neighborhood.Should().Be("Boa Viagem");
    }

    [Fact]
    public void SetAsDefault_ShouldSetTrue()
    {
        var addr = CustomerAddress.Create("user-1", "Casa", "Rua A", "123", null,
            "Centro", "Recife", "PE", "50000-000");

        addr.SetAsDefault();

        addr.IsDefault.Should().BeTrue();
    }

    [Fact]
    public void UnsetDefault_ShouldSetFalse()
    {
        var addr = CustomerAddress.Create("user-1", "Casa", "Rua A", "123", null,
            "Centro", "Recife", "PE", "50000-000");
        addr.SetAsDefault();

        addr.UnsetDefault();

        addr.IsDefault.Should().BeFalse();
    }
}

public class AdditionalShippingTests
{
    private readonly KLL.Store.Application.Services.ShippingService _sut = new();

    [Fact]
    public void Calculate_RJCep_ShouldReturnCorrectPricing()
    {
        var result = _sut.Calculate("20000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(20m);
        result.Options[0].MinDays.Should().Be(5);
        result.Options[0].MaxDays.Should().Be(8);
    }

    [Fact]
    public void Calculate_MGCep_ShouldReturnCorrectPricing()
    {
        var result = _sut.Calculate("30000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(18m);
    }

    [Fact]
    public void Calculate_DFCep_ShouldReturnCorrectPricing()
    {
        var result = _sut.Calculate("70000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(20m);
    }

    [Fact]
    public void Calculate_AMCep_ShouldReturnHighestPrice()
    {
        var result = _sut.Calculate("69000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(40m);
        result.Options[0].MinDays.Should().Be(10);
        result.Options[0].MaxDays.Should().Be(14);
    }

    [Fact]
    public void Calculate_RSCep_ShouldReturnCorrectPricing()
    {
        var result = _sut.Calculate("90000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(22m);
    }

    [Fact]
    public void Calculate_EmptyCep_ShouldReturnError()
    {
        var result = _sut.Calculate("", 100m);

        result.Valid.Should().BeFalse();
        result.Error.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void Calculate_LettersInCep_ShouldReturnError()
    {
        var result = _sut.Calculate("ABCDE-FGH", 100m);

        result.Valid.Should().BeFalse();
    }
}
