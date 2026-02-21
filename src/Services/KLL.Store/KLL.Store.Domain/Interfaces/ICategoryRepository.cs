using KLL.Store.Domain.Entities;

namespace KLL.Store.Domain.Interfaces;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<List<Category>> GetAllAsync(bool activeOnly = true, CancellationToken ct = default);
    Task<List<Category>> GetRootCategoriesAsync(CancellationToken ct = default);
    Task AddAsync(Category category, CancellationToken ct = default);
    void Update(Category category);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
