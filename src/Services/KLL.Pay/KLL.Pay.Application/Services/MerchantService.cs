using KLL.Pay.Application.DTOs.Requests;
using KLL.Pay.Application.DTOs.Responses;
using KLL.Pay.Domain.Entities;
using KLL.Pay.Domain.Interfaces;

namespace KLL.Pay.Application.Services;

public class MerchantService
{
    private readonly IMerchantRepository _repo;
    public MerchantService(IMerchantRepository repo) => _repo = repo;

    public async Task<MerchantResponse> CreateAsync(CreateMerchantRequest req, CancellationToken ct)
    {
        var m = Merchant.Create(req.Name, req.Document, req.Email, req.WebhookUrl);
        await _repo.AddAsync(m, ct);
        await _repo.SaveChangesAsync(ct);
        return Map(m);
    }

    public async Task<MerchantResponse?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var m = await _repo.GetByIdAsync(id, ct);
        return m is null ? null : Map(m);
    }

    public async Task<IEnumerable<MerchantResponse>> GetAllAsync(CancellationToken ct)
    {
        var merchants = await _repo.GetAllAsync(ct);
        return merchants.Select(Map);
    }

    private static MerchantResponse Map(Merchant m) => new(m.Id, m.Name, m.Document, m.Email, m.ApiKey, m.IsActive, m.CreatedAt);
}