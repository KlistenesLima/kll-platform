using FluentValidation;

namespace KLL.Store.Application.Commands.CreateOrder;

public class CreateOrderValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.CustomerEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.Street).NotEmpty();
        RuleFor(x => x.Number).NotEmpty();
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.State).NotEmpty().Length(2);
        RuleFor(x => x.ZipCode).NotEmpty().Matches(@"^\d{5}-?\d{3}$");
        RuleFor(x => x.Items).NotEmpty().WithMessage("Pedido deve ter pelo menos um item");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).NotEmpty();
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
    }
}