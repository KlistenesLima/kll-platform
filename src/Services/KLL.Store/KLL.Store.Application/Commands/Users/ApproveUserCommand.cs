using MediatR;

namespace KLL.Store.Application.Commands.Users;

public record ApproveUserCommand(Guid UserId, Guid AdminId) : IRequest<ApproveUserResult>;
public record ApproveUserResult(bool Success, string? Message);
