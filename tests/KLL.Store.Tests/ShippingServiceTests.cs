using FluentAssertions;
using KLL.Store.Application.Services;
using Xunit;

namespace KLL.Store.Tests;

public class ShippingServiceTests
{
    private readonly ShippingService _sut = new();

    [Fact]
    public void Calculate_ValidCepSP_ShouldReturnSPRegion()
    {
        var result = _sut.Calculate("01310-100", 100m);

        result.Valid.Should().BeTrue();
        result.Error.Should().BeNull();
        result.Options.Should().HaveCountGreaterOrEqualTo(2);
        result.Options[0].Name.Should().Contain("SP");
        result.Options[0].Price.Should().Be(15.90m);
    }

    [Fact]
    public void Calculate_CartAbove299_ShouldReturnFreeShipping()
    {
        var result = _sut.Calculate("01310100", 300m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(0m);
        result.Options[0].Name.Should().Contain("Grátis");
    }

    [Fact]
    public void Calculate_InvalidCep_ShouldReturnError()
    {
        var result = _sut.Calculate("123", 100m);

        result.Valid.Should().BeFalse();
        result.Error.Should().Contain("CEP inválido");
        result.Options.Should().BeEmpty();
    }

    [Fact]
    public void Calculate_NordesteCep_ShouldReturnCorrectPricing()
    {
        var result = _sut.Calculate("40000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Name.Should().Contain("Nordeste");
        result.Options[0].Price.Should().Be(22.90m);
        result.Options[0].MinDays.Should().Be(5);
        result.Options[0].MaxDays.Should().Be(8);
    }

    [Fact]
    public void Calculate_NorteCep_ShouldReturnHigherPrice()
    {
        var result = _sut.Calculate("66000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(29.90m);
    }

    [Fact]
    public void Calculate_SulCep_ShouldReturnSulRegion()
    {
        var result = _sut.Calculate("80000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Name.Should().Contain("Sul");
        result.Options[0].Price.Should().Be(19.90m);
    }

    [Fact]
    public void Calculate_ShouldAlwaysIncludeExpressOption()
    {
        var result = _sut.Calculate("01310100", 100m);

        result.Valid.Should().BeTrue();
        result.Options.Should().HaveCount(2);
        result.Options[1].Name.Should().Contain("Expresso");
        result.Options[1].Price.Should().BeGreaterThan(result.Options[0].Price);
    }
}
