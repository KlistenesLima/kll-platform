using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace KLL.BuildingBlocks.Infrastructure.Auth;

public static class AuthExtensions
{
    public static IServiceCollection AddKllAuth(this IServiceCollection services, IConfiguration config)
    {
        var authority = config["Keycloak:Authority"] ?? "http://localhost:8083/realms/kll-platform";
        var validIssuer = config["Keycloak:ValidIssuer"] ?? authority;

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opt =>
            {
                opt.Authority = authority;
                opt.Audience = "kll-api";
                opt.RequireHttpsMetadata = false;
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false, // Desabilitado para demo — Keycloak issuer varia entre Docker/localhost/produção
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    RoleClaimType = "realm_roles",
                    NameClaimType = "preferred_username"
                };
            });

        services.AddAuthorization(opt =>
        {
            opt.AddPolicy("AdminOnly", p => p.RequireRole("admin", "Administrador"));
            opt.AddPolicy("StaffOnly", p => p.RequireRole("admin", "Administrador", "tecnico", "Tecnico"));
            opt.AddPolicy("CustomerOnly", p => p.RequireRole("customer", "cliente", "Cliente"));
        });

        return services;
    }

    public static string? GetUserId(this ClaimsPrincipal user)
        => user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst("sub")?.Value;

    public static string? GetUserName(this ClaimsPrincipal user)
        => user.FindFirst("preferred_username")?.Value ?? user.FindFirst(ClaimTypes.Name)?.Value;

    public static string? GetUserEmail(this ClaimsPrincipal user)
        => user.FindFirst(ClaimTypes.Email)?.Value ?? user.FindFirst("email")?.Value;

    public static bool IsAdmin(this ClaimsPrincipal user)
        => user.IsInRole("admin") || user.IsInRole("Administrador");

    public static bool IsStaff(this ClaimsPrincipal user)
        => user.IsAdmin() || user.IsInRole("tecnico") || user.IsInRole("Tecnico");
}
