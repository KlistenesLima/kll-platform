namespace KLL.Pay.Application.DTOs.Responses;

public record MerchantResponse(Guid Id, string Name, string Document, string Email, string ApiKey, bool IsActive, DateTime CreatedAt);
public record TransactionResponse(Guid Id, Guid MerchantId, decimal Amount, string Status, string Type, string? PixQrCode, string? BankChargeId, DateTime CreatedAt);