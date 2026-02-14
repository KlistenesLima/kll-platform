using KLL.Logistics.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KLL.Logistics.Infra.Data.Context;

public class LogisticsDbContext : DbContext
{
    public LogisticsDbContext(DbContextOptions<LogisticsDbContext> options) : base(options) { }
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<TrackingEvent> TrackingEvents => Set<TrackingEvent>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Shipment>(e =>
        {
            e.HasKey(s => s.Id); e.HasIndex(s => s.TrackingCode).IsUnique(); e.HasIndex(s => s.OrderId);
            e.Property(s => s.Weight).HasPrecision(10, 2);
            e.HasMany(s => s.TrackingEvents).WithOne().HasForeignKey("ShipmentId");
            e.Ignore(s => s.DomainEvents);
        });
        mb.Entity<TrackingEvent>(e => { e.HasKey(t => t.Id); });
        mb.Entity<Driver>(e => { e.HasKey(d => d.Id); e.Ignore(d => d.DomainEvents); });
    }
}