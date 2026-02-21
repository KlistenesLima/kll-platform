using KLL.Logistics.Domain.Entities;
using KLL.Logistics.Domain.Interfaces;
using KLL.Logistics.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Logistics.Infra.Data.Repositories;

public class ShipmentRepository : IShipmentRepository
{
    private readonly LogisticsDbContext _ctx;
    public ShipmentRepository(LogisticsDbContext ctx) => _ctx = ctx;
    public async Task<Shipment?> GetByIdAsync(Guid id, CancellationToken ct) => await _ctx.Shipments.FindAsync(new object[] { id }, ct);
    public async Task<IEnumerable<Shipment>> GetAllAsync(CancellationToken ct) => await _ctx.Shipments.Include(s => s.TrackingEvents).ToListAsync(ct);
    public async Task<Shipment> AddAsync(Shipment entity, CancellationToken ct) { await _ctx.Shipments.AddAsync(entity, ct); return entity; }
    public Task UpdateAsync(Shipment entity, CancellationToken ct) { _ctx.Shipments.Update(entity); return Task.CompletedTask; }
    public async Task DeleteAsync(Guid id, CancellationToken ct) { var s = await GetByIdAsync(id, ct); if (s != null) _ctx.Shipments.Remove(s); }
    public Task<int> SaveChangesAsync(CancellationToken ct) => _ctx.SaveChangesAsync(ct);
    public async Task<Shipment?> GetByTrackingCodeAsync(string code, CancellationToken ct) => await _ctx.Shipments.Include(s => s.TrackingEvents).FirstOrDefaultAsync(s => s.TrackingCode == code, ct);
    public async Task<Shipment?> GetByOrderIdAsync(Guid orderId, CancellationToken ct) => await _ctx.Shipments.Include(s => s.TrackingEvents).FirstOrDefaultAsync(s => s.OrderId == orderId, ct);
    public async Task<Shipment?> GetWithTrackingAsync(Guid id, CancellationToken ct) => await _ctx.Shipments.Include(s => s.TrackingEvents).FirstOrDefaultAsync(s => s.Id == id, ct);
}

public class DriverRepository : IDriverRepository
{
    private readonly LogisticsDbContext _ctx;
    public DriverRepository(LogisticsDbContext ctx) => _ctx = ctx;
    public async Task<Driver?> GetByIdAsync(Guid id, CancellationToken ct) => await _ctx.Drivers.FindAsync(new object[] { id }, ct);
    public async Task<IEnumerable<Driver>> GetAllAsync(CancellationToken ct) => await _ctx.Drivers.ToListAsync(ct);
    public async Task<Driver> AddAsync(Driver entity, CancellationToken ct) { await _ctx.Drivers.AddAsync(entity, ct); return entity; }
    public Task UpdateAsync(Driver entity, CancellationToken ct) { _ctx.Drivers.Update(entity); return Task.CompletedTask; }
    public async Task DeleteAsync(Guid id, CancellationToken ct) { var d = await GetByIdAsync(id, ct); if (d != null) _ctx.Drivers.Remove(d); }
    public Task<int> SaveChangesAsync(CancellationToken ct) => _ctx.SaveChangesAsync(ct);
    public async Task<IEnumerable<Driver>> GetAvailableAsync(CancellationToken ct) => await _ctx.Drivers.Where(d => d.IsAvailable).ToListAsync(ct);
}
