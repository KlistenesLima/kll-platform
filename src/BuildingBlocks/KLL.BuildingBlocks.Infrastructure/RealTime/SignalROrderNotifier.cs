using Microsoft.AspNetCore.SignalR;

namespace KLL.BuildingBlocks.Infrastructure.RealTime;

public class SignalROrderNotifier : IOrderNotifier
{
    private readonly IHubContext<OrderTrackingHub> _hub;
    public SignalROrderNotifier(IHubContext<OrderTrackingHub> hub) => _hub = hub;

    public async Task NotifyOrderStatusChanged(string orderId, string status, string? trackingCode = null)
        => await _hub.Clients.Group($"order-{orderId}")
            .SendAsync("OrderStatusChanged", new { orderId, status, trackingCode, timestamp = DateTime.UtcNow });

    public async Task NotifyShipmentUpdate(string trackingCode, string status, string description, string location)
        => await _hub.Clients.Group($"tracking-{trackingCode}")
            .SendAsync("ShipmentUpdated", new { trackingCode, status, description, location, timestamp = DateTime.UtcNow });

    public async Task NotifyPaymentConfirmed(string orderId, decimal amount)
        => await _hub.Clients.Group($"order-{orderId}")
            .SendAsync("PaymentConfirmed", new { orderId, amount, timestamp = DateTime.UtcNow });
}
