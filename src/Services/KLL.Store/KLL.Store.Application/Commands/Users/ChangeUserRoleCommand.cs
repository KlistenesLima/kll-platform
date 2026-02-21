using KLL.Store.Domain.Enums;
using MediatR;

namespace KLL.Store.Application.Commands.Users;

public record ChangeUserRoleCommand(Guid UserId, UserRole NewRole, Guid AdminId) : IRequest<ChangeUserRoleResult>;
public record ChangeUserRoleResult(bool Success, string? Message);
