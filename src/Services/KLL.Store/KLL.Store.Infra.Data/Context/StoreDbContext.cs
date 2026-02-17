using KLL.Store.Domain.Entities;
using KLL.BuildingBlocks.Domain.Outbox;
using KLL.BuildingBlocks.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Context;

public class StoreDbContext : DbContext
{
    public StoreDbContext(DbContextOptions<StoreDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();
    public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Ignore<KLL.BuildingBlocks.Domain.Events.DomainEvent>();

        modelBuilder.Entity<Product>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.Name).HasMaxLength(200).IsRequired();
            b.Property(p => p.Description).HasMaxLength(2000);
            b.Property(p => p.Price).HasColumnType("decimal(18,2)");
            b.Property(p => p.Category).HasMaxLength(100);
            b.Property(p => p.ImageUrl).HasMaxLength(500);
            b.HasOne(p => p.CategoryNav).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.SetNull);
            b.HasIndex(p => p.CategoryId);
            b.HasIndex(p => p.IsActive);
        });

        modelBuilder.Entity<Order>(b =>
        {
            b.HasKey(o => o.Id);
            b.OwnsOne(o => o.TotalAmount, m => { m.Property(x => x.Amount).HasColumnType("decimal(18,2)").HasColumnName("TotalAmount"); m.Property(x => x.Currency).HasMaxLength(3).HasColumnName("Currency"); });
            b.OwnsOne(o => o.ShippingAddress, a =>
            {
                a.Property(x => x.Street).HasMaxLength(200).HasColumnName("ShippingStreet");
                a.Property(x => x.Number).HasMaxLength(20).HasColumnName("ShippingNumber");
                a.Property(x => x.Complement).HasMaxLength(100).HasColumnName("ShippingComplement");
                a.Property(x => x.Neighborhood).HasMaxLength(100).HasColumnName("ShippingNeighborhood");
                a.Property(x => x.City).HasMaxLength(100).HasColumnName("ShippingCity");
                a.Property(x => x.State).HasMaxLength(2).HasColumnName("ShippingState");
                a.Property(x => x.ZipCode).HasMaxLength(10).HasColumnName("ShippingZipCode");
            });
            b.Property(o => o.CustomerId).HasMaxLength(200);
            b.Property(o => o.CustomerEmail).HasMaxLength(200);
            b.HasMany(o => o.Items).WithOne().HasForeignKey(i => i.OrderId);
            b.HasIndex(o => o.CustomerId);
        });

        modelBuilder.Entity<OrderItem>(b =>
        {
            b.HasKey(i => i.Id);
            b.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Category>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.Name).HasMaxLength(200).IsRequired();
            b.Property(c => c.Slug).HasMaxLength(200).IsRequired();
            b.Property(c => c.Description).HasMaxLength(1000);
            b.Property(c => c.ImageUrl).HasMaxLength(500);
            b.HasOne(c => c.ParentCategory).WithMany(c => c.SubCategories).HasForeignKey(c => c.ParentCategoryId).OnDelete(DeleteBehavior.Restrict);
            b.HasIndex(c => c.Slug).IsUnique();
        });

        modelBuilder.Entity<Cart>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.CustomerId).HasMaxLength(200).IsRequired();
            b.HasMany(c => c.Items).WithOne().HasForeignKey(i => i.CartId).OnDelete(DeleteBehavior.Cascade);
            b.HasIndex(c => c.CustomerId).IsUnique();
        });

        modelBuilder.Entity<CartItem>(b =>
        {
            b.HasKey(i => i.Id);
            b.Property(i => i.ProductName).HasMaxLength(200);
            b.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
            b.Property(i => i.ImageUrl).HasMaxLength(500);
        });

        modelBuilder.Entity<OutboxMessage>(b =>
        {
            b.HasKey(o => o.Id);
            b.Property(o => o.Type).HasMaxLength(500).IsRequired();
            b.Property(o => o.Content).IsRequired();
            b.HasIndex(o => o.ProcessedOn);
        });

        modelBuilder.Entity<CustomerAddress>(b =>
        {
            b.HasKey(a => a.Id);
            b.ToTable("Addresses");
            b.Property(a => a.CustomerId).HasMaxLength(200).IsRequired();
            b.Property(a => a.Label).HasMaxLength(50).IsRequired();
            b.Property(a => a.Street).HasMaxLength(200).IsRequired();
            b.Property(a => a.Number).HasMaxLength(20).IsRequired();
            b.Property(a => a.Complement).HasMaxLength(100);
            b.Property(a => a.Neighborhood).HasMaxLength(100).IsRequired();
            b.Property(a => a.City).HasMaxLength(100).IsRequired();
            b.Property(a => a.State).HasMaxLength(2).IsRequired();
            b.Property(a => a.ZipCode).HasMaxLength(10).IsRequired();
            b.HasIndex(a => a.CustomerId);
        });

        modelBuilder.Entity<UserProfile>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.CustomerId).HasMaxLength(200).IsRequired();
            b.Property(p => p.AvatarUrl).HasMaxLength(500);
            b.Property(p => p.FirstName).HasMaxLength(100).IsRequired();
            b.Property(p => p.LastName).HasMaxLength(100).IsRequired();
            b.HasIndex(p => p.CustomerId).IsUnique();
        });
    }
}
