using MediatR;

namespace KLL.Store.Application.Commands.Users;

public record ConfirmEmailCommand(string Email, string Code) : IRequest<ConfirmEmailResult>;
public record ConfirmEmailResult(bool Success, string? Message);
