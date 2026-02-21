using MediatR;

namespace KLL.Store.Application.Commands.Users;

public record RejectUserCommand(Guid UserId, Guid AdminId) : IRequest<RejectUserResult>;
public record RejectUserResult(bool Success, string? Message);
