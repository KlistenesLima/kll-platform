using KLL.BuildingBlocks.Domain.Interfaces;
using KLL.Pay.Domain.Entities;

namespace KLL.Pay.Domain.Interfaces;

public interface IMerchantRepository : IRepository<Merchant>
{
    Task<Merchant?> GetByApiKeyAsync(string apiKey, CancellationToken ct = default);
}