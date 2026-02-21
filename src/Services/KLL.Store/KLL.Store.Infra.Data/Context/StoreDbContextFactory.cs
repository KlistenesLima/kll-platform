using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace KLL.Store.Infra.Data.Context;

public class StoreDbContextFactory : IDesignTimeDbContextFactory<StoreDbContext>
{
    public StoreDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<StoreDbContext>();
        var connStr = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Port=5434;Database=kll_store;Username=kll;Password=CHANGE_ME";
        optionsBuilder.UseNpgsql(connStr);
        return new StoreDbContext(optionsBuilder.Options);
    }
}
