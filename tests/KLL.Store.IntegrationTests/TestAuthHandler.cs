using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace KLL.Store.IntegrationTests;

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string DefaultUserId = "test-user-123";
    public const string AdminUserId = "admin-user-456";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder)
        : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.ContainsKey("Authorization"))
            return Task.FromResult(AuthenticateResult.NoResult());

        var authHeader = Request.Headers["Authorization"].ToString();
        var isAdmin = authHeader.Contains("Admin");

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, isAdmin ? AdminUserId : DefaultUserId),
            new("sub", isAdmin ? AdminUserId : DefaultUserId),
            new("preferred_username", isAdmin ? "admin" : "testuser"),
            new(ClaimTypes.Email, isAdmin ? "admin@kll.com" : "test@kll.com"),
            new("realm_roles", "customer"),
        };

        if (isAdmin)
            claims.Add(new Claim("realm_roles", "admin"));

        // The third parameter is nameClaimType, fourth is roleClaimType
        var identity = new ClaimsIdentity(claims, "Test", "preferred_username", "realm_roles");
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, "Test");

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
