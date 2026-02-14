using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.Pay.Application.Services;
using KLL.Store.Domain.Events;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Pay.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class WebhooksController : ControllerBase
{
    private readonly TransactionService _txService;
    private readonly IEventBus _eventBus;
    private readonly ILogger<WebhooksController> _logger;

    public WebhooksController(TransactionService txService, IEventBus eventBus, ILogger<WebhooksController> logger)
    { _txService = txService; _eventBus = eventBus; _logger = logger; }

    /// <summary>
    /// Webhook called by KRT Bank when PIX payment is confirmed
    /// </summary>
    [HttpPost("krt-bank/payment-confirmed")]
    public async Task<IActionResult> KrtBankPaymentConfirmed([FromBody] KrtBankWebhookPayload payload, CancellationToken ct)
    {
        _logger.LogInformation("Received KRT Bank webhook for charge {ChargeId}", payload.ChargeId);

        // Confirm transaction in KLL Pay
        await _txService.ConfirmFromBankAsync(payload.TransactionId, payload.ChargeId, ct);

        // Propagate PaymentConfirmed to KLL Store via Kafka
        await _eventBus.PublishAsync(new PaymentConfirmedIntegrationEvent
        {
            OrderId = payload.OrderId,
            ChargeId = payload.ChargeId,
            Amount = payload.Amount
        }, ct);

        _logger.LogInformation("Payment confirmed and propagated for order {OrderId}", payload.OrderId);
        return Ok(new { received = true });
    }
}

public record KrtBankWebhookPayload(Guid TransactionId, Guid OrderId, string ChargeId, decimal Amount, string Status);