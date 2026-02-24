using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using KLL.Store.Domain.Enums;
using KLL.Store.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace KLL.Store.Application.Commands.Users.Handlers;

public class LoginHandler : IRequestHandler<LoginCommand, LoginResult>
{
    private readonly IAppUserRepository _userRepo;
    private readonly IConfiguration _configuration;
    private readonly ILogger<LoginHandler> _logger;

    public LoginHandler(
        IAppUserRepository userRepo,
        IConfiguration configuration,
        ILogger<LoginHandler> logger)
    {
        _userRepo = userRepo;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var input = request.EmailOrDocument.Trim();

        var user = input.Contains('@')
            ? await _userRepo.GetByEmailAsync(input.ToLowerInvariant())
            : await _userRepo.GetByDocumentAsync(input.Replace(".", "").Replace("-", ""));

        if (user == null)
            return new LoginResult(false, null, "Email/CPF ou senha inválidos", null);

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return new LoginResult(false, null, "Email/CPF ou senha inválidos", null);

        if (user.Status == UserStatus.PendingEmailConfirmation)
            return new LoginResult(false, null, "Confirme seu email antes de fazer login", null);

        if (user.Status == UserStatus.PendingApproval)
            return new LoginResult(false, null, "Seu cadastro está aguardando aprovação do administrador", null);

        if (user.Status == UserStatus.Rejected)
            return new LoginResult(false, null, "Seu cadastro foi rejeitado", null);

        if (user.Status == UserStatus.Inactive)
            return new LoginResult(false, null, "Sua conta está desativada. Entre em contato com o administrador", null);

        if (user.Status != UserStatus.Active)
            return new LoginResult(false, null, "Conta não está ativa", null);

        var token = GenerateJwtToken(user.Id, user.Email, user.FullName, user.Role, user.Document);

        _logger.LogInformation("[Login] User logged in: {UserId} | Role: {Role}", user.Id, user.Role);

        return new LoginResult(true, token, null, user.Role);
    }

    private string GenerateJwtToken(Guid userId, string email, string fullName, UserRole role, string document)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT Key not configured");
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "KLL.Store";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "KLL.Platform";
        var jwtExpiryMinutes = int.TryParse(_configuration["Jwt:ExpiryMinutes"], out var exp) ? exp : 480;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var realmRole = role switch
        {
            UserRole.Administrador => "admin",
            UserRole.Tecnico => "tecnico",
            _ => "cliente"
        };

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, fullName),
            new Claim(ClaimTypes.Role, role.ToString()),
            new Claim("document", document),
            new Claim("role", role.ToString()),
            new Claim("realm_roles", realmRole)
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(jwtExpiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
