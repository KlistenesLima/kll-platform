using MediatR;

namespace KLL.Store.Application.Commands.Users;

public record RequestPasswordResetCommand(string Email) : IRequest<RequestPasswordResetResult>;
public record RequestPasswordResetResult(bool Success, string? Message);
