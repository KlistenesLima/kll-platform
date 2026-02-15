using KLL.BuildingBlocks.CQRS.Abstractions;

namespace KLL.Store.Application.Commands.CreateOrder;

public record CreateOrderCommand(
    string CustomerId, string CustomerEmail,
    string Street, string Number, string? Complement,
    string Neighborhood, string City, string State, string ZipCode,
    List<OrderItemInput> Items
) : ICommand<Guid>;

public record OrderItemInput(Guid ProductId, int Quantity);
