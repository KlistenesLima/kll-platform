using KLL.Store.Application.Interfaces;
using KLL.Store.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace KLL.Store.Application.Commands.Users.Handlers;

public class ApproveUserHandler : IRequestHandler<ApproveUserCommand, ApproveUserResult>
{
    private readonly IAppUserRepository _userRepo;
    private readonly IEmailService _emailService;
    private readonly ILogger<ApproveUserHandler> _logger;

    public ApproveUserHandler(
        IAppUserRepository userRepo,
        IEmailService emailService,
        ILogger<ApproveUserHandler> logger)
    {
        _userRepo = userRepo;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<ApproveUserResult> Handle(ApproveUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepo.GetByIdAsync(request.UserId);
        if (user == null)
            return new ApproveUserResult(false, "Usuário não encontrado");

        user.Approve(request.AdminId.ToString());
        await _userRepo.UpdateAsync(user);

        await _emailService.SendApprovalNotificationAsync(user.Email, user.FullName, user.Email, user.Document);

        _logger.LogInformation("[Approve] User approved: {UserId} by admin {AdminId}", user.Id, request.AdminId);

        return new ApproveUserResult(true, "Usuário aprovado com sucesso");
    }
}
