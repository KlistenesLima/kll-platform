using KLL.Store.Domain.Entities;

namespace KLL.Store.Domain.Interfaces;

public interface IUserProfileRepository
{
    Task<UserProfile?> GetByCustomerIdAsync(string customerId, CancellationToken ct = default);
    Task AddAsync(UserProfile profile, CancellationToken ct = default);
    void Update(UserProfile profile);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
