using KLL.Pay.Application.Integration;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Pay.Api.Controllers;

[ApiController]
[Route("api/v1/pay/health")]
public class PayHealthController : ControllerBase
{
    private readonly KrtBankClient _krtClient;
    private readonly ILogger<PayHealthController> _logger;

    public PayHealthController(KrtBankClient krtClient, ILogger<PayHealthController> logger)
    {
        _krtClient = krtClient;
        _logger = logger;
    }

    [HttpGet("krt")]
    public async Task<IActionResult> CheckKrtBank(CancellationToken ct)
    {
        var available = await _krtClient.IsAvailableAsync(ct);

        var methods = new List<string> { "credit_card_sim" };
        if (available)
        {
            methods.Add("pix");
            methods.Add("boleto");
            methods.Add("credit_card");
        }

        return Ok(new
        {
            available,
            methods,
            timestamp = DateTime.UtcNow
        });
    }
}
