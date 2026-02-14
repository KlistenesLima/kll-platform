using Microsoft.AspNetCore.SignalR;

namespace KLL.BuildingBlocks.Infrastructure.RealTime;

public class OrderTrackingHub : Hub
{
    public async Task JoinOrderGroup(string orderId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"order-{orderId}");
        await Clients.Caller.SendAsync("Joined", $"Tracking order {orderId}");
    }

    public async Task JoinTrackingGroup(string trackingCode)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"tracking-{trackingCode}");
        await Clients.Caller.SendAsync("Joined", $"Tracking shipment {trackingCode}");
    }

    public async Task LeaveOrderGroup(string orderId)
        => await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"order-{orderId}");
}