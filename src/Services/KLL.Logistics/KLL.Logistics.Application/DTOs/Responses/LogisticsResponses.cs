namespace KLL.Logistics.Application.DTOs.Responses;

public record ShipmentResponse(Guid Id, Guid OrderId, string RecipientName, string TrackingCode,
    string Status, string DestinationCity, DateTime? EstimatedDelivery, DateTime? DeliveredAt,
    List<TrackingEventResponse> TrackingEvents);
public record TrackingEventResponse(string Description, string Location, DateTime Timestamp);
public record DriverResponse(Guid Id, string Name, string Phone, string? VehiclePlate, bool IsAvailable);
