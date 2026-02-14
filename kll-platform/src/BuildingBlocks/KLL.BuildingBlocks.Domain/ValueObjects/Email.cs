using System.Text.RegularExpressions;

namespace KLL.BuildingBlocks.Domain.ValueObjects;

public partial record Email
{
    public string Value { get; }

    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !EmailRegex().IsMatch(value))
            throw new ArgumentException($"Invalid email: {value}");
        Value = value.ToLowerInvariant();
    }

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
    private static partial Regex EmailRegex();

    public static implicit operator string(Email e) => e.Value;
    public override string ToString() => Value;
}