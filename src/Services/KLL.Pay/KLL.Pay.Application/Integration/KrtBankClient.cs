using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace KLL.Pay.Application.Integration;

public class KrtBankClient
{
    private readonly HttpClient _http;
    private readonly ILogger<KrtBankClient> _logger;
    private readonly string _baseUrl;

    public KrtBankClient(HttpClient http, IConfiguration config, ILogger<KrtBankClient> logger)
    {
        _http = http;
        _logger = logger;
        _baseUrl = config["KrtBank:BaseUrl"] ?? "http://localhost:5000";
    }

    public async Task<bool> IsAvailableAsync(CancellationToken ct)
    {
        try
        {
            _logger.LogInformation("Checking KRT Bank health at {BaseUrl}/api/v1/health", _baseUrl);
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(5));
            var response = await _http.GetAsync($"{_baseUrl}/api/v1/health", cts.Token);
            var available = response.IsSuccessStatusCode;
            _logger.LogInformation("KRT Bank health check result: {Available} (StatusCode: {StatusCode})", available, response.StatusCode);
            return available;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "KRT Bank health check failed at {BaseUrl}", _baseUrl);
            return false;
        }
    }

    // ===== PIX =====

    public async Task<KrtBankPixChargeResponse?> CreatePixChargeAsync(KrtBankPixChargeRequest request, CancellationToken ct)
    {
        try
        {
            _logger.LogInformation("Creating PIX charge on KRT Bank: {Amount}", request.Amount);
            var response = await _http.PostAsJsonAsync($"{_baseUrl}/api/v1/pix/charges", request, ct);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<KrtBankPixChargeResponse>(cancellationToken: ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create PIX charge on KRT Bank");
            return null;
        }
    }

    public async Task<KrtBankChargeStatus?> GetPixChargeStatusAsync(string chargeId, CancellationToken ct)
    {
        try
        {
            return await _http.GetFromJsonAsync<KrtBankChargeStatus>($"{_baseUrl}/api/v1/pix/charges/{chargeId}", ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get PIX charge status: {ChargeId}", chargeId);
            return null;
        }
    }

    // ===== BOLETO =====

    public async Task<KrtBankBoletoChargeResponse?> CreateBoletoChargeAsync(KrtBankBoletoChargeRequest request, CancellationToken ct)
    {
        try
        {
            _logger.LogInformation("Creating Boleto charge on KRT Bank: {Amount}", request.Amount);
            var response = await _http.PostAsJsonAsync($"{_baseUrl}/api/v1/boletos/charges", request, ct);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<KrtBankBoletoChargeResponse>(cancellationToken: ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create Boleto charge on KRT Bank");
            return null;
        }
    }

    public async Task<KrtBankBoletoStatus?> GetBoletoChargeStatusAsync(string chargeId, CancellationToken ct)
    {
        try
        {
            return await _http.GetFromJsonAsync<KrtBankBoletoStatus>($"{_baseUrl}/api/v1/boletos/charges/{chargeId}", ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get Boleto charge status: {ChargeId}", chargeId);
            return null;
        }
    }

    // ===== CARD =====

    public async Task<KrtBankCardChargeResponse?> CreateCardChargeAsync(KrtBankCardChargeRequest request, CancellationToken ct)
    {
        try
        {
            _logger.LogInformation("Creating Card charge on KRT Bank: {Amount} on card {CardId}", request.Amount, request.CardId);
            var response = await _http.PostAsJsonAsync($"{_baseUrl}/api/v1/cards/charges", request, ct);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<KrtBankCardChargeResponse>(cancellationToken: ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create Card charge on KRT Bank");
            return null;
        }
    }

    public async Task<KrtBankCardChargeStatus?> GetCardChargeStatusAsync(string chargeId, CancellationToken ct)
    {
        try
        {
            return await _http.GetFromJsonAsync<KrtBankCardChargeStatus>($"{_baseUrl}/api/v1/cards/charges/{chargeId}", ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get Card charge status: {ChargeId}", chargeId);
            return null;
        }
    }

    public async Task<KrtBankCardStatementResponse?> GetCardStatementAsync(string cardId, CancellationToken ct)
    {
        try
        {
            return await _http.GetFromJsonAsync<KrtBankCardStatementResponse>($"{_baseUrl}/api/v1/cards/charges/card/{cardId}/statement", ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get card statement: {CardId}", cardId);
            return null;
        }
    }
}

// ===== PIX DTOs =====
public record KrtBankPixChargeRequest(
    decimal Amount,
    string? Description = null,
    string? ExternalId = null,
    string? PayerCpf = null,
    string? MerchantId = null,
    string? WebhookUrl = null);

public record KrtBankPixChargeResponse(
    string ChargeId,
    string QrCode,
    string QrCodeBase64,
    string Status,
    decimal Amount,
    DateTime ExpiresAt);

public record KrtBankChargeStatus(string ChargeId, string ExternalId, decimal Amount, string Status, DateTime? PaidAt, DateTime? CreatedAt, DateTime? ExpiresAt);

// ===== BOLETO DTOs =====
public record KrtBankBoletoChargeRequest(
    decimal Amount,
    string? Description = null,
    string? ExternalId = null,
    string? PayerCpf = null,
    string? PayerName = null,
    string? MerchantId = null,
    string? WebhookUrl = null,
    DateTime? DueDate = null);

public record KrtBankBoletoChargeResponse(
    string ChargeId,
    string Barcode,
    string DigitableLine,
    string Status,
    decimal Amount,
    DateTime DueDate);

public record KrtBankBoletoStatus(string ChargeId, string ExternalId, decimal Amount, string Status, string Barcode, string DigitableLine, DateTime? PaidAt, DateTime DueDate, DateTime CreatedAt);

// ===== CARD DTOs =====
public record KrtBankCardChargeRequest(
    decimal Amount,
    Guid? CardId = null,
    string? Description = null,
    string? ExternalId = null,
    int? Installments = 1,
    string? MerchantId = null,
    string? WebhookUrl = null);

public record KrtBankCardChargeResponse(
    string ChargeId,
    string Status,
    string? AuthorizationCode,
    int Installments,
    decimal InstallmentAmount,
    decimal Amount,
    string? CardLast4,
    string? Reason);

public record KrtBankCardChargeStatus(string ChargeId, Guid CardId, string ExternalId, decimal Amount, string Status, string AuthorizationCode, int Installments, decimal InstallmentAmount, DateTime CreatedAt);

public record KrtBankCardStatementResponse(Guid CardId, string CardLast4, decimal TotalDue, decimal AvailableLimit, decimal SpendingLimit, IEnumerable<object> Charges);
