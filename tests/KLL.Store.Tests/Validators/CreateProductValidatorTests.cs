using FluentAssertions;
using FluentValidation.TestHelper;
using KLL.Store.Application.Commands.CreateProduct;
using Xunit;

namespace KLL.Store.Tests.Validators;

public class CreateProductValidatorTests
{
    private readonly CreateProductValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_ShouldPass()
    {
        var cmd = new CreateProductCommand("Phone", "Desc", 999m, 10, "Electronics", null);
        var result = _validator.TestValidate(cmd);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyName_ShouldFail()
    {
        var cmd = new CreateProductCommand("", "Desc", 999m, 10, "Electronics", null);
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Validate_NegativePrice_ShouldFail()
    {
        var cmd = new CreateProductCommand("Phone", "Desc", -10m, 10, "Electronics", null);
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.Price);
    }

    [Fact]
    public void Validate_NegativeStock_ShouldFail()
    {
        var cmd = new CreateProductCommand("Phone", "Desc", 10m, -5, "Electronics", null);
        var result = _validator.TestValidate(cmd);
        result.ShouldHaveValidationErrorFor(x => x.StockQuantity);
    }
}
