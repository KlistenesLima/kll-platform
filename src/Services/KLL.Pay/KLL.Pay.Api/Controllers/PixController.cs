using KLL.Pay.Application.Integration;
using KLL.Pay.Domain.Entities;
using KLL.Pay.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Pay.Api.Controllers;

[ApiController]
[Route("api/v1/pay/pix")]
public class PixController : ControllerBase
{
    private readonly KrtBankClient _krtClient;
    private readonly ITransactionRepository _txRepo;
    private readonly ILogger<PixController> _logger;

    public PixController(KrtBankClient krtClient, ITransactionRepository txRepo, ILogger<PixController> logger)
    {
        _krtClient = krtClient;
        _txRepo = txRepo;
        _logger = logger;
    }

    [HttpPost("charge")]
    public async Task<IActionResult> CreateCharge([FromBody] CreatePixChargeRequest request, CancellationToken ct)
    {
        if (request.Amount <= 0)
            return BadRequest(new { error = "Valor deve ser maior que zero" });

        var webhookUrl = $"{Request.Scheme}://{Request.Host}/api/v1/webhooks/krt-bank/payment-confirmed";

        var krtRequest = new KrtBankPixChargeRequest(
            Amount: request.Amount,
            Description: request.Description ?? $"Pedido #{request.OrderId?[..8]}",
            ExternalId: request.OrderId ?? "",
            PayerCpf: request.PayerCpf,
            MerchantId: "kll-platform",
            WebhookUrl: webhookUrl
        );

        var result = await _krtClient.CreatePixChargeAsync(krtRequest, ct);
        if (result == null)
            return StatusCode(503, new { error = "KRT Bank indisponivel" });

        // Register local transaction
        Guid.TryParse(request.OrderId, out var orderId);
        var tx = Transaction.CreateCharge(Guid.Empty, request.Amount, TransactionType.Pix,
            request.Description, request.PayerCpf, orderId == Guid.Empty ? null : orderId);
        tx.SetBankChargeId(result.ChargeId);
        await _txRepo.AddAsync(tx, ct);
        await _txRepo.SaveChangesAsync(ct);

        return Ok(new
        {
            chargeId = result.ChargeId,
            qrCode = result.QrCode,
            qrCodeBase64 = result.QrCodeBase64,
            status = result.Status,
            expiresAt = result.ExpiresAt,
            amount = request.Amount,
            transactionId = tx.Id
        });
    }

    [HttpGet("{chargeId}/status")]
    public async Task<IActionResult> GetChargeStatus(string chargeId, CancellationToken ct)
    {
        if (!Guid.TryParse(chargeId, out _))
            return BadRequest(new { error = "chargeId invalido" });

        var result = await _krtClient.GetPixChargeStatusAsync(chargeId, ct);
        if (result == null)
            return StatusCode(503, new { error = "KRT Bank indisponivel" });

        // Sync local transaction status
        if (result.Status is "Confirmed" or "Paid")
        {
            var tx = await _txRepo.GetByBankChargeIdAsync(chargeId, ct);
            if (tx != null && tx.Status == TransactionStatus.Pending)
            {
                tx.Confirm();
                await _txRepo.UpdateAsync(tx, ct);
                await _txRepo.SaveChangesAsync(ct);
                _logger.LogInformation("PIX transaction {TxId} synced to Confirmed from KRT charge {ChargeId}", tx.Id, chargeId);
            }
        }

        return Ok(new
        {
            chargeId = result.ChargeId,
            status = result.Status,
            paidAt = result.PaidAt,
            amount = result.Amount
        });
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> PixWebhook([FromBody] PixWebhookPayload payload, CancellationToken ct)
    {
        _logger.LogInformation("PIX webhook received: {ChargeId} -> {Status}", payload.ChargeId, payload.Status);
        return Ok();
    }
}

public record CreatePixChargeRequest(
    decimal Amount,
    string? OrderId = null,
    string? Description = null,
    string? PayerCpf = null
);

public record PixWebhookPayload(string ChargeId, string ExternalId, string Status, DateTime? PaidAt, decimal Amount);
