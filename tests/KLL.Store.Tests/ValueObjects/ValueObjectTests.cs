using FluentAssertions;
using KLL.BuildingBlocks.Domain.ValueObjects;
using Xunit;

namespace KLL.Store.Tests.ValueObjects;

public class ValueObjectTests
{
    [Fact]
    public void Money_ShouldCompareByValue()
    {
        var a = new Money(100m);
        var b = new Money(100m);
        a.Amount.Should().Be(b.Amount);
    }

    [Fact]
    public void Money_Zero_ShouldBeZero()
    {
        Money.Zero.Amount.Should().Be(0);
    }

    [Fact]
    public void Address_ShouldHoldAllFields()
    {
        var addr = new Address("Rua A", "123", "Apto 4", "Centro", "Recife", "PE", "50000-000");

        addr.Street.Should().Be("Rua A");
        addr.Number.Should().Be("123");
        addr.Complement.Should().Be("Apto 4");
        addr.City.Should().Be("Recife");
        addr.State.Should().Be("PE");
        addr.ZipCode.Should().Be("50000-000");
    }

    [Fact]
    public void Cpf_ValidFormat_ShouldParse()
    {
        var cpf = new Cpf("529.982.247-25");
        cpf.Value.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void Email_ValidFormat_ShouldParse()
    {
        var email = new Email("test@example.com");
        email.Value.Should().Be("test@example.com");
    }
}
