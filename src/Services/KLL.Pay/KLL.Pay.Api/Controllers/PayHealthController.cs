using Microsoft.AspNetCore.Mvc;

namespace KLL.Pay.Api.Controllers;

[ApiController]
[Route("api/v1/pay/health")]
public class PayHealthController : ControllerBase
{
    private readonly IHttpClientFactory _httpFactory;
    private readonly IConfiguration _config;
    private readonly ILogger<PayHealthController> _logger;

    public PayHealthController(IHttpClientFactory httpFactory, IConfiguration config, ILogger<PayHealthController> logger)
    {
        _httpFactory = httpFactory;
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Check if KRT Bank is available and return available payment methods
    /// </summary>
    [HttpGet("krt")]
    public async Task<IActionResult> CheckKrtBank(CancellationToken ct)
    {
        var baseUrl = _config["KrtBank:BaseUrl"] ?? "http://localhost:5002";
        var available = false;

        try
        {
            using var http = _httpFactory.CreateClient();
            http.Timeout = TimeSpan.FromSeconds(5);
            var response = await http.GetAsync($"{baseUrl}/api/v1/health", ct);
            available = response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning("KRT Bank health check failed: {Message}", ex.Message);
        }

        var methods = new List<string> { "credit_card_sim" };
        if (available) methods.Add("pix");

        return Ok(new
        {
            available,
            methods,
            krtBankUrl = available ? baseUrl : null
        });
    }
}
