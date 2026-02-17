using KLL.Store.Domain.Entities;

namespace KLL.Store.Domain.Interfaces;

public interface IAddressRepository
{
    Task<List<CustomerAddress>> GetByCustomerIdAsync(string customerId, CancellationToken ct = default);
    Task<CustomerAddress?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<int> CountByCustomerIdAsync(string customerId, CancellationToken ct = default);
    Task AddAsync(CustomerAddress address, CancellationToken ct = default);
    void Update(CustomerAddress address);
    void Delete(CustomerAddress address);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
