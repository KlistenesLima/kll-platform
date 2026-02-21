using KLL.Store.Application.DTOs.Requests;
using KLL.Store.Application.DTOs.Responses;

namespace KLL.Store.Application.Interfaces;

public interface IProductService
{
    Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken ct = default);
    Task<ProductResponse?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<ProductResponse>> GetAllAsync(CancellationToken ct = default);
    Task<IEnumerable<ProductResponse>> SearchAsync(string term, CancellationToken ct = default);
    Task<ProductResponse> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
