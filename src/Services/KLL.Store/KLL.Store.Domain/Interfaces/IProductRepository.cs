using KLL.BuildingBlocks.Domain.Interfaces;
using KLL.Store.Domain.Entities;

namespace KLL.Store.Domain.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<IEnumerable<Product>> GetByCategoryAsync(string category, CancellationToken ct = default);
    Task<IEnumerable<Product>> SearchAsync(string term, CancellationToken ct = default);
}
