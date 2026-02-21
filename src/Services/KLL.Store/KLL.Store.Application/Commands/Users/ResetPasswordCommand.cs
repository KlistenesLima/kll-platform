using MediatR;

namespace KLL.Store.Application.Commands.Users;

public record ResetPasswordCommand(string Email, string Code, string NewPassword) : IRequest<ResetPasswordResult>;
public record ResetPasswordResult(bool Success, string? Message);
