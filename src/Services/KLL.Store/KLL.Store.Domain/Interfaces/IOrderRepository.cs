using KLL.BuildingBlocks.Domain.Interfaces;
using KLL.Store.Domain.Entities;

namespace KLL.Store.Domain.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<IEnumerable<Order>> GetByCustomerIdAsync(string customerId, CancellationToken ct = default);
    Task<Order?> GetWithItemsAsync(Guid orderId, CancellationToken ct = default);
}
