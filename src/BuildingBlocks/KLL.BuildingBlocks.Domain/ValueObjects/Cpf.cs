namespace KLL.BuildingBlocks.Domain.ValueObjects;

public record Cpf
{
    public string Value { get; }

    public Cpf(string value)
    {
        var cleaned = new string(value.Where(char.IsDigit).ToArray());
        if (cleaned.Length != 11) throw new ArgumentException($"Invalid CPF: {value}");
        Value = cleaned;
    }

    public string Formatted => $"{Value[..3]}.{Value[3..6]}.{Value[6..9]}-{Value[9..]}";
    public static implicit operator string(Cpf c) => c.Value;
    public override string ToString() => Value;
}