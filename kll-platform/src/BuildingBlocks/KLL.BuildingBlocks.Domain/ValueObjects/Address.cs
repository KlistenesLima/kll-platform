namespace KLL.BuildingBlocks.Domain.ValueObjects;

public record Address(
    string Street,
    string Number,
    string? Complement,
    string Neighborhood,
    string City,
    string State,
    string ZipCode)
{
    public override string ToString() => $"{Street}, {Number}{(Complement != null ? $" - {Complement}" : "")}, {Neighborhood}, {City}/{State} - {ZipCode}";
}