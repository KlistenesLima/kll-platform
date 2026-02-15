using KLL.BuildingBlocks.Domain.Entities;

namespace KLL.Logistics.Domain.Entities;

public class Driver : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Document { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string? VehiclePlate { get; private set; }
    public bool IsAvailable { get; private set; } = true;
    public double? CurrentLatitude { get; private set; }
    public double? CurrentLongitude { get; private set; }

    private Driver() { }

    public static Driver Create(string name, string document, string phone, string? vehiclePlate)
    {
        return new Driver { Name = name, Document = document, Phone = phone, VehiclePlate = vehiclePlate };
    }

    public void UpdateLocation(double lat, double lng) { CurrentLatitude = lat; CurrentLongitude = lng; SetUpdated(); }
    public void SetAvailable(bool available) { IsAvailable = available; SetUpdated(); }
}
