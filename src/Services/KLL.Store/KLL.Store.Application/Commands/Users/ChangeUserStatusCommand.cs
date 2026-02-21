using MediatR;

namespace KLL.Store.Application.Commands.Users;

public record ChangeUserStatusCommand(Guid UserId, bool Activate, Guid AdminId) : IRequest<ChangeUserStatusResult>;
public record ChangeUserStatusResult(bool Success, string? Message);
