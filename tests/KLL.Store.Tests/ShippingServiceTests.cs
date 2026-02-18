using FluentAssertions;
using KLL.Store.Application.Services;
using Xunit;

namespace KLL.Store.Tests;

public class ShippingServiceTests
{
    private readonly ShippingService _sut = new();

    [Fact]
    public void Calculate_ValidCepSP_ShouldReturnStandardOption()
    {
        var result = _sut.Calculate("01310-100", 100m);

        result.Valid.Should().BeTrue();
        result.Error.Should().BeNull();
        result.Options.Should().HaveCountGreaterOrEqualTo(2);
        result.Options[0].Name.Should().Be("Entrega Padrao");
        result.Options[0].Price.Should().Be(15m);
    }

    [Fact]
    public void Calculate_CartAboveFreeThreshold_ShouldReturnFreeShipping()
    {
        var result = _sut.Calculate("01310100", 5000m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(0m);
        result.Options[0].Name.Should().Contain("FRETE GRATIS");
    }

    [Fact]
    public void Calculate_InvalidCep_ShouldReturnError()
    {
        var result = _sut.Calculate("123", 100m);

        result.Valid.Should().BeFalse();
        result.Error.Should().Contain("CEP invalido");
        result.Options.Should().BeEmpty();
    }

    [Fact]
    public void Calculate_NordesteCep_ShouldReturnCorrectPricing()
    {
        // BA region: prefix 40-48
        var result = _sut.Calculate("40000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Name.Should().Be("Entrega Padrao");
        result.Options[0].Price.Should().Be(25m);
        result.Options[0].MinDays.Should().Be(6);
        result.Options[0].MaxDays.Should().Be(9);
    }

    [Fact]
    public void Calculate_NorteCep_ShouldReturnHigherPrice()
    {
        // PA region: prefix 66-68
        var result = _sut.Calculate("66000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(35m);
    }

    [Fact]
    public void Calculate_SulCep_ShouldReturnCorrectPricing()
    {
        // PR region: prefix 80-87
        var result = _sut.Calculate("80000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options[0].Name.Should().Be("Entrega Padrao");
        result.Options[0].Price.Should().Be(18m);
    }

    [Fact]
    public void Calculate_SPCep_ShouldIncludeExpressAndSameDay()
    {
        // SP prefix 01-19: should have 3 options (Padrao, Expressa, Mesmo Dia)
        var result = _sut.Calculate("01310100", 100m);

        result.Valid.Should().BeTrue();
        result.Options.Should().HaveCount(3);
        result.Options[0].Name.Should().Be("Entrega Padrao");
        result.Options[1].Name.Should().Be("Entrega Expressa");
        result.Options[1].Price.Should().BeGreaterThan(result.Options[0].Price);
        result.Options[2].Name.Should().Be("Entrega no Mesmo Dia");
    }

    [Fact]
    public void Calculate_NonSPCep_ShouldHaveTwoOptions()
    {
        // RJ prefix 20-28: should have 2 options (no same day)
        var result = _sut.Calculate("20000-000", 100m);

        result.Valid.Should().BeTrue();
        result.Options.Should().HaveCount(2);
        result.Options[0].Name.Should().Be("Entrega Padrao");
        result.Options[1].Name.Should().Be("Entrega Expressa");
    }

    [Fact]
    public void Calculate_ExpressFreeTenThousand_ShouldBeFree()
    {
        var result = _sut.Calculate("01310100", 10000m);

        result.Valid.Should().BeTrue();
        result.Options[0].Price.Should().Be(0m);
        result.Options[1].Price.Should().Be(0m);
        result.Options[0].Name.Should().Contain("FRETE GRATIS");
        result.Options[1].Name.Should().Contain("FRETE GRATIS");
    }

    [Fact]
    public void Calculate_CepWithDash_ShouldWork()
    {
        var result = _sut.Calculate("01310-100", 100m);

        result.Valid.Should().BeTrue();
        result.Options.Should().NotBeEmpty();
    }

    [Fact]
    public void Calculate_AllDigitsCep_ShouldWork()
    {
        var result = _sut.Calculate("01310100", 100m);

        result.Valid.Should().BeTrue();
        result.Options.Should().NotBeEmpty();
    }

    [Fact]
    public void Calculate_SameDayOption_ShouldBeZeroDays()
    {
        var result = _sut.Calculate("01310100", 100m);

        var sameDay = result.Options.First(o => o.Name == "Entrega no Mesmo Dia");
        sameDay.MinDays.Should().Be(0);
        sameDay.MaxDays.Should().Be(0);
        sameDay.Price.Should().Be(60m);
    }
}
