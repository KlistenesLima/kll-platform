using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace KLL.Store.Infra.Data.Context;

public class StoreDbContextFactory : IDesignTimeDbContextFactory<StoreDbContext>
{
    public StoreDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<StoreDbContext>();
        optionsBuilder.UseNpgsql("Host=localhost;Port=5434;Database=kll_store;Username=kll;Password=REDACTED_DB_PASSWORD");
        return new StoreDbContext(optionsBuilder.Options);
    }
}
