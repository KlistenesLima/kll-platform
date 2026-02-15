using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.Pay.Application.DTOs.Requests;
using KLL.Pay.Application.DTOs.Responses;
using KLL.Pay.Domain.Entities;
using KLL.Pay.Domain.Events;
using KLL.Pay.Domain.Interfaces;

namespace KLL.Pay.Application.Services;

public class TransactionService
{
    private readonly ITransactionRepository _txRepo;
    private readonly IMerchantRepository _merchantRepo;
    private readonly IEventBus _eventBus;

    public TransactionService(ITransactionRepository txRepo, IMerchantRepository merchantRepo, IEventBus eventBus)
    { _txRepo = txRepo; _merchantRepo = merchantRepo; _eventBus = eventBus; }

    public async Task<TransactionResponse> CreateChargeAsync(CreateChargeRequest req, CancellationToken ct)
    {
        var merchant = await _merchantRepo.GetByApiKeyAsync(req.ApiKey, ct)
            ?? throw new ArgumentException("Invalid API Key");

        var type = Enum.Parse<TransactionType>(req.Type, true);
        var tx = Transaction.CreateCharge(merchant.Id, req.Amount, type, req.Description, req.PayerDocument, req.ExternalOrderId);

        await _txRepo.AddAsync(tx, ct);
        await _txRepo.SaveChangesAsync(ct);

        // Publish to KRT Bank for actual payment processing
        await _eventBus.PublishAsync(new PaymentRequestedToKrtBankEvent
        {
            TransactionId = tx.Id, MerchantId = merchant.Id,
            Amount = tx.Amount, PaymentType = req.Type,
            PayerDocument = req.PayerDocument, Description = req.Description
        }, ct);

        return Map(tx);
    }

    public async Task<TransactionResponse?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var tx = await _txRepo.GetByIdAsync(id, ct);
        return tx is null ? null : Map(tx);
    }

    public async Task<IEnumerable<TransactionResponse>> GetByMerchantAsync(Guid merchantId, CancellationToken ct)
    {
        var txs = await _txRepo.GetByMerchantIdAsync(merchantId, ct);
        return txs.Select(Map);
    }

    public async Task ConfirmFromBankAsync(Guid transactionId, string bankChargeId, CancellationToken ct)
    {
        var tx = await _txRepo.GetByIdAsync(transactionId, ct)
            ?? throw new KeyNotFoundException($"Transaction {transactionId} not found");
        tx.ConfirmPayment(bankChargeId);
        await _txRepo.UpdateAsync(tx, ct);
        await _txRepo.SaveChangesAsync(ct);
    }

    private static TransactionResponse Map(Transaction tx) => new(tx.Id, tx.MerchantId, tx.Amount,
        tx.Status.ToString(), tx.Type.ToString(), tx.PixQrCode, tx.BankChargeId, tx.CreatedAt);
}
