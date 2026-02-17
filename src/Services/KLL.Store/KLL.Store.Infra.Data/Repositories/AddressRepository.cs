using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Repositories;

public class AddressRepository : IAddressRepository
{
    private readonly StoreDbContext _db;
    public AddressRepository(StoreDbContext db) => _db = db;

    public async Task<List<CustomerAddress>> GetByCustomerIdAsync(string customerId, CancellationToken ct = default)
        => await _db.CustomerAddresses.Where(a => a.CustomerId == customerId).OrderByDescending(a => a.IsDefault).ThenBy(a => a.Label).ToListAsync(ct);

    public async Task<CustomerAddress?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.CustomerAddresses.FindAsync(new object[] { id }, ct);

    public async Task<int> CountByCustomerIdAsync(string customerId, CancellationToken ct = default)
        => await _db.CustomerAddresses.CountAsync(a => a.CustomerId == customerId, ct);

    public async Task AddAsync(CustomerAddress address, CancellationToken ct = default)
        => await _db.CustomerAddresses.AddAsync(address, ct);

    public void Update(CustomerAddress address) => _db.CustomerAddresses.Update(address);
    public void Delete(CustomerAddress address) => _db.CustomerAddresses.Remove(address);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _db.SaveChangesAsync(ct);
}
