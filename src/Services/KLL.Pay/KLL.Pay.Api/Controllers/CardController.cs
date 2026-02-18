using KLL.Pay.Application.Integration;
using KLL.Pay.Domain.Entities;
using KLL.Pay.Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Pay.Api.Controllers;

[ApiController]
[Route("api/v1/pay/card")]
public class CardController : ControllerBase
{
    private readonly KrtBankClient _krtClient;
    private readonly ITransactionRepository _txRepo;
    private readonly ILogger<CardController> _logger;

    public CardController(KrtBankClient krtClient, ITransactionRepository txRepo, ILogger<CardController> logger)
    {
        _krtClient = krtClient;
        _txRepo = txRepo;
        _logger = logger;
    }

    [HttpPost("charge")]
    public async Task<IActionResult> CreateCharge([FromBody] CreateCardChargeRequest request, CancellationToken ct)
    {
        if (request.Amount <= 0)
            return BadRequest(new { error = "Valor deve ser maior que zero" });

        var webhookUrl = $"{Request.Scheme}://{Request.Host}/api/v1/webhooks/krt-bank/payment-confirmed";

        var krtRequest = new KrtBankCardChargeRequest(
            CardId: request.CardId,
            Amount: request.Amount,
            Description: request.Description ?? $"Pedido AUREA Maison",
            ExternalId: request.OrderId ?? "",
            Installments: request.Installments,
            MerchantId: "kll-platform",
            WebhookUrl: webhookUrl
        );

        var result = await _krtClient.CreateCardChargeAsync(krtRequest, ct);
        if (result == null)
            return StatusCode(503, new { error = "KRT Bank indisponivel" });

        // Register local transaction
        Guid.TryParse(request.OrderId, out var orderId);
        var tx = Transaction.CreateCharge(Guid.Empty, request.Amount, TransactionType.CreditCard,
            request.Description, null, orderId == Guid.Empty ? null : orderId);
        tx.SetBankChargeId(result.ChargeId);

        if (result.Status == "Approved")
            tx.Confirm();
        else if (result.Status == "Declined")
            tx.Fail(result.Reason ?? "Cartao recusado");

        await _txRepo.AddAsync(tx, ct);
        await _txRepo.SaveChangesAsync(ct);

        return Ok(new
        {
            chargeId = result.ChargeId,
            status = result.Status,
            authorizationCode = result.AuthorizationCode,
            installments = result.Installments,
            installmentAmount = result.InstallmentAmount,
            amount = result.Amount,
            cardLast4 = result.CardLast4,
            reason = result.Reason,
            transactionId = tx.Id
        });
    }

    [HttpGet("{chargeId}/status")]
    public async Task<IActionResult> GetChargeStatus(string chargeId, CancellationToken ct)
    {
        if (!Guid.TryParse(chargeId, out _))
            return BadRequest(new { error = "chargeId invalido" });

        var result = await _krtClient.GetCardChargeStatusAsync(chargeId, ct);
        if (result == null)
            return StatusCode(503, new { error = "KRT Bank indisponivel" });

        // Sync local transaction status
        if (result.Status is "Approved" or "Confirmed")
        {
            var tx = await _txRepo.GetByBankChargeIdAsync(chargeId, ct);
            if (tx != null && tx.Status == TransactionStatus.Pending)
            {
                tx.Confirm();
                await _txRepo.UpdateAsync(tx, ct);
                await _txRepo.SaveChangesAsync(ct);
                _logger.LogInformation("Card transaction {TxId} synced to Confirmed from KRT charge {ChargeId}", tx.Id, chargeId);
            }
        }

        return Ok(new
        {
            chargeId = result.ChargeId,
            status = result.Status,
            amount = result.Amount,
            authorizationCode = result.AuthorizationCode,
            installments = result.Installments,
            installmentAmount = result.InstallmentAmount
        });
    }

    [HttpGet("{cardId}/statement")]
    public async Task<IActionResult> GetStatement(string cardId, CancellationToken ct)
    {
        var result = await _krtClient.GetCardStatementAsync(cardId, ct);
        if (result == null)
            return StatusCode(503, new { error = "KRT Bank indisponivel" });

        return Ok(result);
    }
}

public record CreateCardChargeRequest(
    Guid CardId,
    decimal Amount,
    string? OrderId = null,
    string? Description = null,
    int? Installments = 1
);
