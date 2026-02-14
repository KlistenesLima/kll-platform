using FluentValidation;

namespace KLL.Store.Application.Commands.CreateProduct;

public class CreateProductValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200).WithMessage("Nome Ã© obrigatÃ³rio (max 200 chars)");
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Price).GreaterThan(0).WithMessage("PreÃ§o deve ser maior que zero");
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
    }
}