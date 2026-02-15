using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace KLL.Pay.Infra.Data.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Merchants",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Document = table.Column<string>(type: "text", nullable: false),
                Email = table.Column<string>(type: "text", nullable: false),
                WebhookUrl = table.Column<string>(type: "text", nullable: true),
                ApiKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_Merchants", x => x.Id));

        migrationBuilder.CreateTable(
            name: "Transactions",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                MerchantId = table.Column<Guid>(type: "uuid", nullable: false),
                ExternalOrderId = table.Column<Guid>(type: "uuid", nullable: true),
                Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                Currency = table.Column<string>(type: "text", nullable: false),
                Status = table.Column<string>(type: "text", nullable: false),
                Type = table.Column<string>(type: "text", nullable: false),
                PixQrCode = table.Column<string>(type: "text", nullable: true),
                Description = table.Column<string>(type: "text", nullable: true),
                PayerDocument = table.Column<string>(type: "text", nullable: true),
                BankChargeId = table.Column<string>(type: "text", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_Transactions", x => x.Id));

        migrationBuilder.CreateTable(
            name: "OutboxMessages",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Type = table.Column<string>(type: "text", nullable: false),
                Content = table.Column<string>(type: "text", nullable: false),
                OccurredOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                ProcessedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                Error = table.Column<string>(type: "text", nullable: true),
                RetryCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
            },
            constraints: table => table.PrimaryKey("PK_OutboxMessages", x => x.Id));

        migrationBuilder.CreateIndex(name: "IX_Merchants_ApiKey", table: "Merchants", column: "ApiKey", unique: true);
        migrationBuilder.CreateIndex(name: "IX_Transactions_MerchantId", table: "Transactions", column: "MerchantId");
        migrationBuilder.CreateIndex(name: "IX_Transactions_ExternalOrderId", table: "Transactions", column: "ExternalOrderId");
        migrationBuilder.CreateIndex(name: "IX_OutboxMessages_ProcessedOn_RetryCount",
            table: "OutboxMessages", columns: new[] { "ProcessedOn", "RetryCount" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Transactions");
        migrationBuilder.DropTable(name: "Merchants");
        migrationBuilder.DropTable(name: "OutboxMessages");
    }
}
