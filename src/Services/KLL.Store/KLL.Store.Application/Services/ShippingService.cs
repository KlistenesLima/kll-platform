namespace KLL.Store.Application.Services;

public record ShippingOption(string Name, decimal Price, int MinDays, int MaxDays);
public record ShippingResult(bool Valid, string? Error, List<ShippingOption> Options);

public class ShippingService
{
    private const decimal FreeStandardThreshold = 5000m;
    private const decimal FreeExpressThreshold = 10000m;

    public ShippingResult Calculate(string cep, decimal cartTotal)
    {
        var digits = new string(cep.Where(char.IsDigit).ToArray());
        if (digits.Length != 8)
            return new ShippingResult(false, "CEP invalido. Informe 8 digitos.", []);

        var prefix = int.Parse(digits[..2]);
        var info = GetRegionInfo(prefix);
        var options = new List<ShippingOption>();

        // Standard
        var stdPrice = cartTotal >= FreeStandardThreshold ? 0m : info.StdPrice;
        var stdLabel = stdPrice == 0 ? "Entrega Padrao — FRETE GRATIS" : "Entrega Padrao";
        options.Add(new ShippingOption(stdLabel, stdPrice, info.StdMinDays, info.StdMaxDays));

        // Express
        if (info.ExpPrice > 0)
        {
            var expPrice = cartTotal >= FreeExpressThreshold ? 0m : info.ExpPrice;
            var expLabel = expPrice == 0 ? "Entrega Expressa — FRETE GRATIS" : "Entrega Expressa";
            options.Add(new ShippingOption(expLabel, expPrice, info.ExpMinDays, info.ExpMaxDays));
        }

        // SameDay (only for SP)
        if (prefix >= 1 && prefix <= 19)
        {
            options.Add(new ShippingOption("Entrega no Mesmo Dia", 60m, 0, 0));
        }

        return new ShippingResult(true, null, options);
    }

    private record RegionInfo(decimal StdPrice, int StdMinDays, int StdMaxDays, decimal ExpPrice, int ExpMinDays, int ExpMaxDays);

    private static RegionInfo GetRegionInfo(int prefix)
    {
        return prefix switch
        {
            >= 1 and <= 19   => new(15m, 5, 7, 35m, 2, 3),    // SP
            >= 20 and <= 28  => new(20m, 5, 8, 40m, 3, 4),    // RJ
            29               => new(22m, 6, 8, 42m, 3, 4),    // ES
            >= 30 and <= 39  => new(18m, 5, 7, 38m, 2, 3),    // MG
            >= 40 and <= 48  => new(25m, 6, 9, 45m, 3, 5),    // BA
            >= 49 and <= 49  => new(27m, 7, 10, 48m, 4, 5),   // SE
            >= 50 and <= 56  => new(25m, 6, 9, 45m, 3, 5),    // PE
            57               => new(27m, 7, 10, 48m, 4, 5),   // AL
            58               => new(27m, 7, 10, 48m, 4, 5),   // PB
            >= 59 and <= 59  => new(27m, 7, 10, 48m, 4, 5),   // RN
            >= 60 and <= 63  => new(25m, 6, 9, 45m, 3, 5),    // CE
            64               => new(28m, 7, 10, 50m, 4, 5),   // PI
            65               => new(30m, 8, 11, 52m, 4, 6),   // MA
            >= 66 and <= 68  => new(35m, 9, 12, 55m, 5, 6),   // PA
            69               => new(40m, 10, 14, 65m, 6, 8),  // AM
            >= 70 and <= 73  => new(20m, 5, 8, 40m, 3, 4),    // DF/GO
            >= 74 and <= 76  => new(25m, 6, 9, 45m, 4, 5),    // GO/TO
            77               => new(28m, 7, 10, 50m, 4, 5),   // TO
            78               => new(30m, 7, 10, 50m, 4, 5),   // MT
            79               => new(25m, 6, 9, 45m, 3, 5),    // MS
            >= 80 and <= 87  => new(18m, 5, 7, 38m, 2, 3),    // PR
            >= 88 and <= 89  => new(20m, 5, 8, 40m, 3, 4),    // SC
            >= 90 and <= 99  => new(22m, 6, 8, 42m, 3, 4),    // RS
            _                => new(30m, 8, 12, 55m, 5, 7),   // Demais
        };
    }
}
