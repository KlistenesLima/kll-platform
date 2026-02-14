using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Polly;

namespace KLL.Pay.Application.Integration;

public class KrtBankClient
{
    private readonly HttpClient _http;
    private readonly ILogger<KrtBankClient> _logger;
    private readonly string _paymentsUrl;

    public KrtBankClient(HttpClient http, IConfiguration config, ILogger<KrtBankClient> logger)
    {
        _http = http;
        _logger = logger;
        _paymentsUrl = config["KrtBank:PaymentsApi"] ?? "http://localhost:5002";
    }

    /// <summary>
    /// Create a PIX charge on KRT Bank Payments API
    /// </summary>
    public async Task<KrtBankChargeResponse?> CreatePixChargeAsync(KrtBankChargeRequest request, CancellationToken ct)
    {
        try
        {
            _logger.LogInformation("Creating PIX charge on KRT Bank: {Amount} for {Description}",
                request.Amount, request.Description);

            var response = await _http.PostAsJsonAsync($"{_paymentsUrl}/api/v1/pix/charge", request, ct);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<KrtBankChargeResponse>(cancellationToken: ct);
            _logger.LogInformation("KRT Bank charge created: {ChargeId}", result?.ChargeId);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create PIX charge on KRT Bank");
            return null;
        }
    }

    /// <summary>
    /// Check charge status on KRT Bank
    /// </summary>
    public async Task<KrtBankChargeStatus?> GetChargeStatusAsync(string chargeId, CancellationToken ct)
    {
        try
        {
            var response = await _http.GetFromJsonAsync<KrtBankChargeStatus>(
                $"{_paymentsUrl}/api/v1/pix/charge/{chargeId}/status", ct);
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get charge status from KRT Bank: {ChargeId}", chargeId);
            return null;
        }
    }
}

public record KrtBankChargeRequest(
    decimal Amount,
    string Description,
    string PixKey,
    string CallbackUrl,
    string ExternalId
);

public record KrtBankChargeResponse(
    string ChargeId,
    string QrCode,
    string QrCodeBase64,
    string Status,
    DateTime ExpiresAt
);

public record KrtBankChargeStatus(string ChargeId, string Status, DateTime? PaidAt);