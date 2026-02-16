namespace KLL.Store.Application.Services;

public record ShippingOption(string Name, decimal Price, int MinDays, int MaxDays);
public record ShippingResult(bool Valid, string? Error, List<ShippingOption> Options);

public class ShippingService
{
    private const decimal FreeShippingThreshold = 299m;

    public ShippingResult Calculate(string cep, decimal cartTotal)
    {
        var digits = new string(cep.Where(char.IsDigit).ToArray());
        if (digits.Length != 8)
            return new ShippingResult(false, "CEP inválido. Informe 8 dígitos.", []);

        var prefix = int.Parse(digits[..3]);
        var (region, basePrice, minDays, maxDays) = GetRegionInfo(prefix);

        var options = new List<ShippingOption>();

        if (cartTotal >= FreeShippingThreshold)
        {
            options.Add(new ShippingOption($"Padrão ({region}) — Frete Grátis", 0, minDays, maxDays));
        }
        else
        {
            options.Add(new ShippingOption($"Padrão ({region})", basePrice, minDays, maxDays));
        }

        options.Add(new ShippingOption("Expresso", basePrice * 1.8m, Math.Max(1, minDays - 2), Math.Max(2, maxDays - 2)));

        return new ShippingResult(true, null, options);
    }

    private static (string Region, decimal Price, int MinDays, int MaxDays) GetRegionInfo(int cepPrefix)
    {
        return cepPrefix switch
        {
            // SP
            >= 10 and <= 199 => ("SP", 15.90m, 3, 5),
            // RJ
            >= 200 and <= 289 => ("RJ", 15.90m, 3, 5),
            // MG
            >= 300 and <= 399 => ("MG", 15.90m, 3, 5),
            // Sul (PR, SC, RS)
            >= 800 and <= 899 or >= 880 and <= 899 or >= 900 and <= 999 => ("Sul", 19.90m, 4, 6),
            // Nordeste (BA, SE, AL, PE, PB, RN, CE, PI, MA)
            >= 400 and <= 659 => ("Nordeste", 22.90m, 5, 8),
            // Norte (PA, AM, AC, RR, RO, AP, TO)
            >= 660 and <= 699 or >= 760 and <= 799 or >= 690 and <= 699 => ("Norte", 29.90m, 8, 12),
            // Centro-Oeste (DF, GO, MT, MS)
            >= 700 and <= 759 => ("Centro-Oeste", 19.90m, 4, 7),
            // ES
            >= 290 and <= 299 => ("ES", 18.90m, 4, 6),
            // Default
            _ => ("Brasil", 22.90m, 5, 10),
        };
    }
}
