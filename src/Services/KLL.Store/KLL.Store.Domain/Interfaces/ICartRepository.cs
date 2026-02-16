using KLL.Store.Domain.Entities;

namespace KLL.Store.Domain.Interfaces;

public interface ICartRepository
{
    Task<Cart?> GetByCustomerIdAsync(string customerId, CancellationToken ct = default);
    Task AddAsync(Cart cart, CancellationToken ct = default);
    void Update(Cart cart);
    void Delete(Cart cart);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
