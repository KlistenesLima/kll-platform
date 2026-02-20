using KLL.BuildingBlocks.Domain.Outbox;
using Microsoft.EntityFrameworkCore;
namespace KLL.BuildingBlocks.Infrastructure.Persistence;
public static class OutboxDbContextExtensions
{
    public static ModelBuilder ConfigureOutbox(this ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<OutboxMessage>(b =>
        {
            b.ToTable("outbox_messages");
            b.HasKey(x => x.Id);
            b.Property(x => x.Type).HasMaxLength(500).IsRequired();
            b.Property(x => x.Content).IsRequired();
            b.HasIndex(x => x.ProcessedOn);
        });
        return modelBuilder;
    }
}