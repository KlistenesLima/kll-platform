using KLL.BuildingBlocks.Domain.Interfaces;
using KLL.Pay.Domain.Entities;

namespace KLL.Pay.Domain.Interfaces;

public interface ITransactionRepository : IRepository<Transaction>
{
    Task<IEnumerable<Transaction>> GetByMerchantIdAsync(Guid merchantId, CancellationToken ct = default);
}