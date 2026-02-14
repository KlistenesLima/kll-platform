using KLL.BuildingBlocks.Domain.Results;
using MediatR;

namespace KLL.Store.Application.Commands;

public record CreateOrderCommand(
    string CustomerId, string CustomerEmail,
    string Street, string Number, string? Complement,
    string Neighborhood, string City, string State, string ZipCode,
    List<OrderItemDto> Items
) : IRequest<Result<Guid>>;

public record OrderItemDto(Guid ProductId, int Quantity);