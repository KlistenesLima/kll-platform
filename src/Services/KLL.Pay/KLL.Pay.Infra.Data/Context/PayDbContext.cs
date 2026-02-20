using KLL.BuildingBlocks.Infrastructure.Outbox;
using KLL.Pay.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace KLL.Pay.Infra.Data.Context;

public class PayDbContext : DbContext
{
    public PayDbContext(DbContextOptions<PayDbContext> options) : base(options) { }

    public DbSet<Merchant> Merchants => Set<Merchant>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Merchant>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.Name).HasMaxLength(200).IsRequired();
            b.Property(e => e.ApiKey).HasMaxLength(100);
            b.HasIndex(e => e.ApiKey).IsUnique();
            b.Ignore(e => e.DomainEvents);
        });

        modelBuilder.Entity<Transaction>(b =>
        {
            b.HasKey(e => e.Id);
            b.Property(e => e.Amount).HasPrecision(18, 2);
            b.Property(e => e.Status).HasConversion<string>();
            b.Property(e => e.Type).HasConversion<string>();
            b.HasIndex(e => e.MerchantId);
            b.HasIndex(e => e.ExternalOrderId);
            b.Ignore(e => e.DomainEvents);
        });

        modelBuilder.Entity<OutboxMessage>(b =>
        {
            b.HasKey(e => e.Id);
            b.HasIndex(e => new { e.ProcessedOn, e.RetryCount });
        });
    }
}
