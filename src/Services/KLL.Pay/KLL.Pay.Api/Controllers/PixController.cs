using KLL.Pay.Application.Integration;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Pay.Api.Controllers;

[ApiController]
[Route("api/v1/pay/pix")]
public class PixController : ControllerBase
{
    private readonly KrtBankClient _krtClient;
    private readonly ILogger<PixController> _logger;

    public PixController(KrtBankClient krtClient, ILogger<PixController> logger)
    {
        _krtClient = krtClient;
        _logger = logger;
    }

    /// <summary>
    /// Create a PIX charge via KRT Bank
    /// </summary>
    [HttpPost("charge")]
    public async Task<IActionResult> CreateCharge([FromBody] CreatePixChargeRequest request, CancellationToken ct)
    {
        if (request.Amount <= 0)
            return BadRequest(new { error = "Valor deve ser maior que zero" });

        var webhookUrl = $"{Request.Scheme}://{Request.Host}/api/v1/webhooks/krt-bank/payment-confirmed";

        var krtRequest = new KrtBankChargeRequest(
            Amount: request.Amount,
            Description: request.Description ?? $"Pedido #{request.OrderId?[..8]}",
            PixKey: "aurea@krtbank.com.br",
            CallbackUrl: webhookUrl,
            ExternalId: request.OrderId ?? ""
        );

        var result = await _krtClient.CreatePixChargeAsync(krtRequest, ct);
        if (result == null)
            return ServiceUnavailable(new { error = "KRT Bank indisponivel" });

        return Ok(new
        {
            chargeId = result.ChargeId,
            qrCode = result.QrCode,
            qrCodeBase64 = result.QrCodeBase64,
            status = result.Status,
            expiresAt = result.ExpiresAt,
            amount = request.Amount
        });
    }

    /// <summary>
    /// Check PIX charge status
    /// </summary>
    [HttpGet("{chargeId}/status")]
    public async Task<IActionResult> GetChargeStatus(string chargeId, CancellationToken ct)
    {
        if (!Guid.TryParse(chargeId, out _))
            return BadRequest(new { error = "chargeId invalido" });

        var result = await _krtClient.GetChargeStatusAsync(chargeId, ct);
        if (result == null)
            return ServiceUnavailable(new { error = "KRT Bank indisponivel" });

        return Ok(new
        {
            chargeId = result.ChargeId,
            status = result.Status,
            paidAt = result.PaidAt
        });
    }

    private ObjectResult ServiceUnavailable(object value) =>
        StatusCode(StatusCodes.Status503ServiceUnavailable, value);
}

public record CreatePixChargeRequest(
    decimal Amount,
    string? OrderId = null,
    string? Description = null,
    string? PayerCpf = null
);
