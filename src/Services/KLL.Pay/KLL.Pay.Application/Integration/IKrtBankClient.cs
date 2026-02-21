namespace KLL.Pay.Application.Integration;

public interface IKrtBankClient
{
    Task<KrtChargeResponse> CreateChargeAsync(KrtChargeRequest request, CancellationToken ct = default);
    Task<KrtChargeStatusResponse> GetChargeStatusAsync(string chargeId, CancellationToken ct = default);
    Task<KrtRefundResponse> RefundChargeAsync(string chargeId, decimal? amount, CancellationToken ct = default);
}

public record KrtChargeRequest(
    decimal Amount,
    string Currency,
    string PaymentMethod,  // "pix", "boleto"
    string Description,
    string ExternalId,     // KLL Order ID
    string WebhookUrl,
    KrtPixDetails? Pix = null
);

public record KrtPixDetails(string? PixKey, int ExpirationMinutes = 30);

public record KrtChargeResponse(
    string ChargeId,
    string Status,
    decimal Amount,
    string? PixQrCode,
    string? PixCopyPaste,
    DateTime ExpiresAt
);

public record KrtChargeStatusResponse(string ChargeId, string Status, DateTime? PaidAt, string? BankTransactionId);

public record KrtRefundResponse(string RefundId, string Status, decimal Amount);
