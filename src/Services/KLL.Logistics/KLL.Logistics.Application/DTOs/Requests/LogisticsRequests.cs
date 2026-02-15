namespace KLL.Logistics.Application.DTOs.Requests;

public record CreateShipmentRequest(Guid OrderId, string RecipientName, string RecipientEmail,
    string Address, string City, string State, string ZipCode, decimal Weight);
public record CreateDriverRequest(string Name, string Document, string Phone, string? VehiclePlate);
public record UpdateLocationRequest(string Description, string Location);
