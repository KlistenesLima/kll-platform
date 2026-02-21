using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.Logistics.Application.DTOs.Requests;
using KLL.Logistics.Application.DTOs.Responses;
using KLL.Logistics.Domain.Entities;
using KLL.Logistics.Domain.Events;
using KLL.Logistics.Domain.Interfaces;

namespace KLL.Logistics.Application.Services;

public class ShipmentService
{
    private readonly IShipmentRepository _repo;
    private readonly IEventBus _eventBus;

    public ShipmentService(IShipmentRepository repo, IEventBus eventBus) { _repo = repo; _eventBus = eventBus; }

    public async Task<ShipmentResponse> CreateAsync(CreateShipmentRequest req, CancellationToken ct)
    {
        var shipment = Shipment.Create(req.OrderId, req.RecipientName, req.RecipientEmail,
            req.Address, req.City, req.State, req.ZipCode, req.Weight);
        await _repo.AddAsync(shipment, ct);
        await _repo.SaveChangesAsync(ct);

        await _eventBus.PublishAsync(new ShipmentCreatedIntegrationEvent
        { ShipmentId = shipment.Id, OrderId = req.OrderId, TrackingCode = shipment.TrackingCode }, ct);

        return Map(shipment);
    }

    public async Task<IEnumerable<ShipmentResponse>> GetAllAsync(CancellationToken ct)
    {
        var shipments = await _repo.GetAllAsync(ct);
        return shipments.Select(Map);
    }

    public async Task<ShipmentResponse?> GetByOrderIdAsync(Guid orderId, CancellationToken ct)
    {
        var s = await _repo.GetByOrderIdAsync(orderId, ct);
        return s is null ? null : Map(s);
    }

    public async Task<ShipmentResponse?> GetByTrackingCodeAsync(string code, CancellationToken ct)
    {
        var s = await _repo.GetByTrackingCodeAsync(code, ct);
        return s is null ? null : Map(s);
    }

    public async Task<ShipmentResponse?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        var s = await _repo.GetWithTrackingAsync(id, ct);
        return s is null ? null : Map(s);
    }

    public async Task AssignDriverAsync(Guid shipmentId, Guid driverId, CancellationToken ct)
    {
        var s = await _repo.GetByIdAsync(shipmentId, ct) ?? throw new KeyNotFoundException("Shipment not found");
        s.AssignDriver(driverId);
        await _repo.UpdateAsync(s, ct);
        await _repo.SaveChangesAsync(ct);
    }

    public async Task UpdateStatusAsync(Guid shipmentId, int status, string description, string? location, CancellationToken ct)
    {
        var s = await _repo.GetWithTrackingAsync(shipmentId, ct) ?? throw new KeyNotFoundException("Shipment not found");
        var newStatus = (ShipmentStatus)status;
        s.UpdateStatus(newStatus, description, location);
        await _repo.SaveChangesAsync(ct);

        if (newStatus == ShipmentStatus.Delivered)
        {
            await _eventBus.PublishAsync(new ShipmentDeliveredIntegrationEvent
            { ShipmentId = s.Id, OrderId = s.OrderId, TrackingCode = s.TrackingCode }, ct);
        }
    }

    public async Task MarkDeliveredAsync(Guid shipmentId, CancellationToken ct)
    {
        var s = await _repo.GetByIdAsync(shipmentId, ct) ?? throw new KeyNotFoundException("Shipment not found");
        s.MarkDelivered();
        await _repo.UpdateAsync(s, ct);
        await _repo.SaveChangesAsync(ct);

        await _eventBus.PublishAsync(new ShipmentDeliveredIntegrationEvent
        { ShipmentId = s.Id, OrderId = s.OrderId, TrackingCode = s.TrackingCode }, ct);
    }

    private static ShipmentResponse Map(Shipment s) => new(s.Id, s.OrderId, s.RecipientName,
        s.TrackingCode, s.Status.ToString(), s.DestinationCity, s.EstimatedDelivery, s.DeliveredAt,
        s.TrackingEvents.Select(e => new TrackingEventResponse(e.Description, e.Location, e.Timestamp)).ToList());
}
