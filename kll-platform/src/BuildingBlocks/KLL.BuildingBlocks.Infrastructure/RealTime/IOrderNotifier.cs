namespace KLL.BuildingBlocks.Infrastructure.RealTime;

public interface IOrderNotifier
{
    Task NotifyOrderStatusChanged(string orderId, string status, string? trackingCode = null);
    Task NotifyShipmentUpdate(string trackingCode, string status, string description, string location);
    Task NotifyPaymentConfirmed(string orderId, decimal amount);
}