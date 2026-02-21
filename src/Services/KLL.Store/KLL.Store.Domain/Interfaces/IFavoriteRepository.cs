using KLL.Store.Domain.Entities;

namespace KLL.Store.Domain.Interfaces;

public interface IFavoriteRepository
{
    Task<List<Favorite>> GetByCustomerIdAsync(string customerId, CancellationToken ct = default);
    Task<Favorite?> GetAsync(string customerId, Guid productId, CancellationToken ct = default);
    Task<bool> ExistsAsync(string customerId, Guid productId, CancellationToken ct = default);
    Task<List<Guid>> GetProductIdsAsync(string customerId, CancellationToken ct = default);
    Task AddAsync(Favorite favorite, CancellationToken ct = default);
    void Delete(Favorite favorite);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
