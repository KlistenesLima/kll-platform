using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly StoreDbContext _db;
    public UserProfileRepository(StoreDbContext db) => _db = db;

    public async Task<UserProfile?> GetByCustomerIdAsync(string customerId, CancellationToken ct = default)
        => await _db.UserProfiles.FirstOrDefaultAsync(p => p.CustomerId == customerId, ct);

    public async Task AddAsync(UserProfile profile, CancellationToken ct = default)
        => await _db.UserProfiles.AddAsync(profile, ct);

    public void Update(UserProfile profile) => _db.UserProfiles.Update(profile);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _db.SaveChangesAsync(ct);
}
