using Microsoft.AspNetCore.SignalR;

namespace KLL.BuildingBlocks.Infrastructure.SignalR;

public class OrderTrackingHub : Hub
{
    public async Task JoinOrderGroup(string orderId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"order-{orderId}");
    }

    public async Task JoinTrackingGroup(string trackingCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tracking-{trackingCode}");
    }

    public async Task LeaveOrderGroup(string orderId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"order-{orderId}");
    }
}

public interface IOrderTrackingClient
{
    Task OrderStatusChanged(string orderId, string status, string? trackingCode);
    Task ShipmentUpdated(string trackingCode, string status, string description, string location);
    Task PaymentConfirmed(string orderId, decimal amount);
}
