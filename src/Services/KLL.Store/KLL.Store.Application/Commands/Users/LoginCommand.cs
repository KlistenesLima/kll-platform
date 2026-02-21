using KLL.Store.Domain.Enums;
using MediatR;

namespace KLL.Store.Application.Commands.Users;

public record LoginCommand(string EmailOrDocument, string Password) : IRequest<LoginResult>;
public record LoginResult(bool Success, string? Token, string? Message, UserRole? Role);
