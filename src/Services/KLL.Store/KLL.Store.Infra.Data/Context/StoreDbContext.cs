using KLL.BuildingBlocks.Domain.Outbox;
using KLL.BuildingBlocks.Infrastructure.Persistence;
using KLL.Store.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Context;

public class StoreDbContext : DbContext
{
    public StoreDbContext(DbContextOptions<StoreDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.Category).HasMaxLength(100);
            b.OwnsOne(x => x.Price, p => p.Property(m => m.Amount).HasColumnName("price").HasColumnType("decimal(18,2)"));
            b.HasIndex(x => x.Category);
            b.HasIndex(x => x.IsActive);
        });

        modelBuilder.Entity<Order>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.CustomerId).HasMaxLength(100).IsRequired();
            b.Property(x => x.CustomerEmail).HasMaxLength(200);
            b.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            b.Property(x => x.TrackingCode).HasMaxLength(50);
            b.Property(x => x.PaymentChargeId).HasMaxLength(100);
            b.OwnsOne(x => x.TotalAmount, p => p.Property(m => m.Amount).HasColumnName("total_amount").HasColumnType("decimal(18,2)"));
            b.OwnsOne(x => x.ShippingAddress, a =>
            {
                a.Property(x => x.Street).HasColumnName("shipping_street").HasMaxLength(200);
                a.Property(x => x.Number).HasColumnName("shipping_number").HasMaxLength(20);
                a.Property(x => x.Complement).HasColumnName("shipping_complement").HasMaxLength(100);
                a.Property(x => x.Neighborhood).HasColumnName("shipping_neighborhood").HasMaxLength(100);
                a.Property(x => x.City).HasColumnName("shipping_city").HasMaxLength(100);
                a.Property(x => x.State).HasColumnName("shipping_state").HasMaxLength(2);
                a.Property(x => x.ZipCode).HasColumnName("shipping_zipcode").HasMaxLength(10);
            });
            b.HasMany(x => x.Items).WithOne().HasForeignKey("OrderId");
            b.HasIndex(x => x.CustomerId);
            b.HasIndex(x => x.TrackingCode).IsUnique().HasFilter("tracking_code IS NOT NULL");
        });

        modelBuilder.Entity<OrderItem>(b =>
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.ProductName).HasMaxLength(200);
            b.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            b.Property(x => x.Total).HasColumnType("decimal(18,2)");
        });

        modelBuilder.ConfigureOutbox();
    }
}