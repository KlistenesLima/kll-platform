using KLL.Pay.Application.DTOs.Requests;
using KLL.Pay.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Pay.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly TransactionService _svc;
    public TransactionsController(TransactionService svc) => _svc = svc;

    [HttpPost("charge")]
    public async Task<IActionResult> CreateCharge([FromBody] CreateChargeRequest req, CancellationToken ct)
    {
        var tx = await _svc.CreateChargeAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = tx.Id }, tx);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var tx = await _svc.GetByIdAsync(id, ct);
        return tx is null ? NotFound() : Ok(tx);
    }

    [HttpGet("merchant/{merchantId:guid}")]
    public async Task<IActionResult> GetByMerchant(Guid merchantId, CancellationToken ct) => Ok(await _svc.GetByMerchantAsync(merchantId, ct));

    [HttpPost("{id:guid}/confirm")]
    public async Task<IActionResult> Confirm(Guid id, [FromBody] ConfirmRequest req, CancellationToken ct)
    { await _svc.ConfirmFromBankAsync(id, req.BankChargeId, ct); return NoContent(); }
}

public record ConfirmRequest(string BankChargeId);