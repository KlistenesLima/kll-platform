using KLL.BuildingBlocks.Domain.IntegrationEvents;
using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.Pay.Application.Services;
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

    [HttpPost("krt-bank/payment-confirmed")]
    public async Task<IActionResult> KrtBankPaymentConfirmed([FromBody] KrtBankWebhookPayload payload, CancellationToken ct)
    {
        _logger.LogInformation("Received KRT Bank webhook for charge {ChargeId}", payload.ChargeId);

        await _txService.ConfirmFromBankAsync(payload.TransactionId, payload.ChargeId, ct);

        await _eventBus.PublishAsync(new PaymentConfirmedIntegrationEvent
        {
            OrderId = payload.OrderId,
            ChargeId = payload.ChargeId,
            Amount = payload.Amount
        }, ct);

        _logger.LogInformation("Payment confirmed for order {OrderId}", payload.OrderId);
        return Ok(new { received = true });
    }
}

public record KrtBankWebhookPayload(Guid TransactionId, Guid OrderId, string ChargeId, decimal Amount, string Status);
