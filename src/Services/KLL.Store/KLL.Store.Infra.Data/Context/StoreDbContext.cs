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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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
            b.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
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

        modelBuilder.ApplyOutboxConfiguration();
    }
}
