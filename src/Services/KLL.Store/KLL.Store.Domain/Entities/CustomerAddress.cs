using KLL.BuildingBlocks.Domain.Entities;

namespace KLL.Store.Domain.Entities;

public class CustomerAddress : BaseEntity
{
    public string CustomerId { get; private set; } = string.Empty;
    public string Label { get; private set; } = string.Empty;
    public string Street { get; private set; } = string.Empty;
    public string Number { get; private set; } = string.Empty;
    public string? Complement { get; private set; }
    public string Neighborhood { get; private set; } = string.Empty;
    public string City { get; private set; } = string.Empty;
    public string State { get; private set; } = string.Empty;
    public string ZipCode { get; private set; } = string.Empty;
    public bool IsDefault { get; private set; }

    private CustomerAddress() { }

    public static CustomerAddress Create(string customerId, string label, string street, string number,
        string? complement, string neighborhood, string city, string state, string zipCode)
    {
        return new CustomerAddress
        {
            CustomerId = customerId,
            Label = label,
            Street = street,
            Number = number,
            Complement = complement,
            Neighborhood = neighborhood,
            City = city,
            State = state,
            ZipCode = zipCode,
            IsDefault = false
        };
    }

    public void Update(string label, string street, string number, string? complement,
        string neighborhood, string city, string state, string zipCode)
    {
        Label = label;
        Street = street;
        Number = number;
        Complement = complement;
        Neighborhood = neighborhood;
        City = city;
        State = state;
        ZipCode = zipCode;
        SetUpdated();
    }

    public void SetAsDefault()
    {
        IsDefault = true;
        SetUpdated();
    }

    public void UnsetDefault()
    {
        IsDefault = false;
        SetUpdated();
    }
}
