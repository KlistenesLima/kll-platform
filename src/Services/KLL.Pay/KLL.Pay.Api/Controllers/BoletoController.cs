using KLL.Pay.Application.Integration;
using KLL.Pay.Domain.Entities;
using KLL.Pay.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Pay.Api.Controllers;

[ApiController]
[Route("api/v1/pay/boleto")]
public class BoletoController : ControllerBase
{
    private readonly KrtBankClient _krtClient;
    private readonly ITransactionRepository _txRepo;
    private readonly ILogger<BoletoController> _logger;

    public BoletoController(KrtBankClient krtClient, ITransactionRepository txRepo, ILogger<BoletoController> logger)
    {
        _krtClient = krtClient;
        _txRepo = txRepo;
        _logger = logger;
    }

    [HttpPost("charge")]
    public async Task<IActionResult> CreateCharge([FromBody] CreateBoletoChargeRequest request, CancellationToken ct)
    {
        if (request.Amount <= 0)
            return BadRequest(new { error = "Valor deve ser maior que zero" });

        var webhookUrl = $"{Request.Scheme}://{Request.Host}/api/v1/webhooks/krt-bank/payment-confirmed";

        var krtRequest = new KrtBankBoletoChargeRequest(
            Amount: request.Amount,
            Description: request.Description ?? $"Pedido #{request.OrderId?[..8]}",
            ExternalId: request.OrderId ?? "",
            PayerCpf: request.PayerCpf,
            PayerName: request.PayerName,
            MerchantId: "kll-platform",
            WebhookUrl: webhookUrl,
            DueDate: request.DueDate
        );

        var result = await _krtClient.CreateBoletoChargeAsync(krtRequest, ct);
        if (result == null)
            return StatusCode(503, new { error = "KRT Bank indisponivel" });

        // Register local transaction
        Guid.TryParse(request.OrderId, out var orderId);
        var tx = Transaction.CreateCharge(Guid.Empty, request.Amount, TransactionType.Boleto,
            request.Description, request.PayerCpf, orderId == Guid.Empty ? null : orderId);
        tx.SetBankChargeId(result.ChargeId);
        await _txRepo.AddAsync(tx, ct);
        await _txRepo.SaveChangesAsync(ct);

        return Ok(new
        {
            chargeId = result.ChargeId,
            barcode = result.Barcode,
            digitableLine = result.DigitableLine,
            status = result.Status,
            amount = request.Amount,
            dueDate = result.DueDate,
            transactionId = tx.Id
        });
    }

    [HttpGet("{chargeId}/status")]
    public async Task<IActionResult> GetChargeStatus(string chargeId, CancellationToken ct)
    {
        if (!Guid.TryParse(chargeId, out _))
            return BadRequest(new { error = "chargeId invalido" });

        var result = await _krtClient.GetBoletoChargeStatusAsync(chargeId, ct);
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
                _logger.LogInformation("Boleto transaction {TxId} synced to Confirmed from KRT charge {ChargeId}", tx.Id, chargeId);
            }
        }

        return Ok(new
        {
            chargeId = result.ChargeId,
            status = result.Status,
            paidAt = result.PaidAt,
            amount = result.Amount,
            barcode = result.Barcode,
            digitableLine = result.DigitableLine,
            dueDate = result.DueDate
        });
    }
}

public record CreateBoletoChargeRequest(
    decimal Amount,
    string? OrderId = null,
    string? Description = null,
    string? PayerCpf = null,
    string? PayerName = null,
    DateTime? DueDate = null
);
