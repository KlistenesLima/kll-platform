using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;

    public AuthController(IHttpClientFactory httpClientFactory, IConfiguration config)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email))
            return BadRequest(new { error = "E-mail e obrigatorio" });
        if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 8)
            return BadRequest(new { error = "A senha deve ter no minimo 8 caracteres" });

        var authority = _config["Keycloak:Authority"] ?? "http://keycloak:8080/realms/kll-platform";
        var keycloakUrl = authority.Replace("/realms/kll-platform", "");
        var adminUser = _config["Keycloak:AdminUser"] ?? "admin";
        var adminPass = _config["Keycloak:AdminPassword"] ?? "admin";

        var client = _httpClientFactory.CreateClient();

        // 1. Get admin token
        var tokenResponse = await client.PostAsync(
            $"{keycloakUrl}/realms/master/protocol/openid-connect/token",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "password",
                ["client_id"] = "admin-cli",
                ["username"] = adminUser,
                ["password"] = adminPass
            }));

        if (!tokenResponse.IsSuccessStatusCode)
            return StatusCode(500, new { error = "Erro ao conectar com servidor de autenticacao" });

        var tokenData = JsonSerializer.Deserialize<JsonElement>(await tokenResponse.Content.ReadAsStringAsync());
        var adminToken = tokenData.GetProperty("access_token").GetString();

        // 2. Create user in Keycloak
        var username = req.Username ?? req.Email;
        var userPayload = new Dictionary<string, object?>
        {
            ["username"] = username,
            ["email"] = req.Email,
            ["firstName"] = req.FirstName ?? "",
            ["lastName"] = req.LastName ?? "",
            ["enabled"] = true,
            ["emailVerified"] = true,
            ["credentials"] = new[] { new { type = "password", value = req.Password, temporary = false } },
        };

        if (!string.IsNullOrWhiteSpace(req.Cpf))
            userPayload["attributes"] = new Dictionary<string, string[]> { ["cpf"] = [req.Cpf] };

        var createRequest = new HttpRequestMessage(HttpMethod.Post,
            $"{keycloakUrl}/admin/realms/kll-platform/users")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(userPayload), Encoding.UTF8, "application/json")
        };
        createRequest.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        var createResponse = await client.SendAsync(createRequest);

        if (createResponse.StatusCode == System.Net.HttpStatusCode.Conflict)
            return Conflict(new { error = "Ja existe uma conta com este e-mail" });

        if (!createResponse.IsSuccessStatusCode)
            return StatusCode(500, new { error = "Erro ao criar conta" });

        return Created("", new { message = "Conta criada com sucesso" });
    }
}

public record RegisterRequest(
    string? Username,
    string Email,
    string Password,
    string? FirstName,
    string? LastName,
    string? Cpf
);
