using KLL.Store.Application.Commands.Users;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Registro de novo usuário (2 etapas: email + aprovação admin).
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var command = new RegisterUserCommand(request.FullName, request.Email, request.Document, request.Password);
        var result = await _mediator.Send(command);

        if (!result.Success)
            return BadRequest(new { success = false, message = result.Message });

        return Created("", new
        {
            success = true,
            userId = result.UserId,
            message = result.Message
        });
    }

    /// <summary>
    /// Confirmação de email com código de 6 dígitos.
    /// </summary>
    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequest request)
    {
        var command = new ConfirmEmailCommand(request.Email, request.Code);
        var result = await _mediator.Send(command);

        if (!result.Success)
            return BadRequest(new { success = false, message = result.Message });

        return Ok(new { success = true, message = result.Message });
    }

    /// <summary>
    /// Login via email/CPF + senha → JWT token.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var login = request.ResolvedLogin;
        if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { success = false, message = "Email/CPF e senha são obrigatórios" });

        var command = new LoginCommand(login, request.Password);
        var result = await _mediator.Send(command);

        if (!result.Success)
            return Unauthorized(new { success = false, message = result.Message });

        return Ok(new
        {
            success = true,
            token = result.Token,
            role = result.Role?.ToString()
        });
    }

    /// <summary>
    /// Solicitar recuperação de senha.
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var command = new RequestPasswordResetCommand(request.Email);
        var result = await _mediator.Send(command);

        return Ok(new { success = true, message = result.Message });
    }

    /// <summary>
    /// Redefinir senha com código de recuperação.
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var command = new ResetPasswordCommand(request.Email, request.Code, request.NewPassword);
        var result = await _mediator.Send(command);

        if (!result.Success)
            return BadRequest(new { success = false, message = result.Message });

        return Ok(new { success = true, message = result.Message });
    }
}

// Request DTOs
public record RegisterRequest(string FullName, string Email, string Document, string Password);
public record ConfirmEmailRequest(string Email, string Code);
public class LoginRequest
{
    public string? EmailOrDocument { get; set; }
    public string? Identifier { get; set; }
    public string Password { get; set; } = "";
    public string ResolvedLogin => !string.IsNullOrWhiteSpace(EmailOrDocument) ? EmailOrDocument : Identifier ?? "";
}
public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Email, string Code, string NewPassword);
