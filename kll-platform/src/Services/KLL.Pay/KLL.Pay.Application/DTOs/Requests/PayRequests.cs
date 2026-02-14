namespace KLL.Pay.Application.DTOs.Requests;

public record CreateMerchantRequest(string Name, string Document, string Email, string? WebhookUrl);
public record CreateChargeRequest(string ApiKey, decimal Amount, string Type, string? Description, string? PayerDocument, Guid? ExternalOrderId);