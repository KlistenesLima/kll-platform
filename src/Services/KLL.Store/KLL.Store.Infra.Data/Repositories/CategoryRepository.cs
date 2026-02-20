using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly StoreDbContext _db;
    public CategoryRepository(StoreDbContext db) => _db = db;

    public async Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Categories.Include(c => c.SubCategories).FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await _db.Categories.FirstOrDefaultAsync(c => c.Slug == slug, ct);

    public async Task<List<Category>> GetAllAsync(bool activeOnly = true, CancellationToken ct = default)
        => await _db.Categories.Where(c => !activeOnly || c.IsActive).OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name).ToListAsync(ct);

    public async Task<List<Category>> GetRootCategoriesAsync(CancellationToken ct = default)
        => await _db.Categories.Where(c => c.ParentCategoryId == null && c.IsActive)
            .Include(c => c.SubCategories.Where(s => s.IsActive))
            .OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name).ToListAsync(ct);

    public async Task AddAsync(Category category, CancellationToken ct = default)
        => await _db.Categories.AddAsync(category, ct);

    public void Update(Category category) => _db.Categories.Update(category);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _db.SaveChangesAsync(ct);
}
