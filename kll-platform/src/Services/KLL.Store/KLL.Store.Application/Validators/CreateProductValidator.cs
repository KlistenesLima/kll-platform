using FluentValidation;
using KLL.Store.Application.Commands;

namespace KLL.Store.Application.Validators;

public class CreateProductValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200).WithMessage("Product name is required (max 200 chars)");
        RuleFor(x => x.Price).GreaterThan(0).WithMessage("Price must be greater than zero");
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0).WithMessage("Stock cannot be negative");
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
    }
}

public class CreateOrderValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.CustomerEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.Street).NotEmpty();
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.State).NotEmpty().Length(2);
        RuleFor(x => x.ZipCode).NotEmpty().Matches(@"^\d{5}-?\d{3}$");
        RuleFor(x => x.Items).NotEmpty().WithMessage("Order must have at least one item");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
    }
}