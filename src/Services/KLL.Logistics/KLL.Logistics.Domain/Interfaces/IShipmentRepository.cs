using KLL.BuildingBlocks.Domain.Interfaces;
using KLL.Logistics.Domain.Entities;

namespace KLL.Logistics.Domain.Interfaces;

public interface IShipmentRepository : IRepository<Shipment>
{
    Task<Shipment?> GetByTrackingCodeAsync(string trackingCode, CancellationToken ct = default);
    Task<Shipment?> GetByOrderIdAsync(Guid orderId, CancellationToken ct = default);
    Task<Shipment?> GetWithTrackingAsync(Guid id, CancellationToken ct = default);
}

public interface IDriverRepository : IRepository<Driver>
{
    Task<IEnumerable<Driver>> GetAvailableAsync(CancellationToken ct = default);
}
