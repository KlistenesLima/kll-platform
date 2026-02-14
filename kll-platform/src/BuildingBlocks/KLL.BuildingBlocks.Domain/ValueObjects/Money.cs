namespace KLL.BuildingBlocks.Domain.ValueObjects;

public record Money
{
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "BRL";

    public Money(decimal amount, string currency = "BRL")
    {
        if (amount < 0) throw new ArgumentException("Amount cannot be negative");
        Amount = amount;
        Currency = currency;
    }

    public static Money Zero(string currency = "BRL") => new(0, currency);
    public static Money Of(decimal amount) => new(amount);

    public Money Add(Money other)
    {
        if (Currency != other.Currency) throw new InvalidOperationException("Cannot add different currencies");
        return new Money(Amount + other.Amount, Currency);
    }

    public Money Subtract(Money other)
    {
        if (Currency != other.Currency) throw new InvalidOperationException("Cannot subtract different currencies");
        if (Amount < other.Amount) throw new InvalidOperationException("Insufficient balance");
        return new Money(Amount - other.Amount, Currency);
    }

    public static implicit operator decimal(Money m) => m.Amount;
    public override string ToString() => $"{Currency} {Amount:N2}";
}