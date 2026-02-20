namespace KLL.Pay.Domain.Interfaces;

public interface IMerchantRepository
{
    Task<IEnumerable<Domain.Entities.Merchant>> GetAllAsync(CancellationToken ct = default);
    Task<Domain.Entities.Merchant?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Domain.Entities.Merchant?> GetByApiKeyAsync(string apiKey, CancellationToken ct = default);
    Task<Domain.Entities.Merchant> AddAsync(Domain.Entities.Merchant merchant, CancellationToken ct = default);
    Task UpdateAsync(Domain.Entities.Merchant entity, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}