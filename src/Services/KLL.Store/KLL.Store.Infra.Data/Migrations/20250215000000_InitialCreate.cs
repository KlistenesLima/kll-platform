using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace KLL.Store.Infra.Data.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Products",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                Description = table.Column<string>(type: "text", nullable: false),
                price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                StockQuantity = table.Column<int>(type: "integer", nullable: false),
                Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                ImageUrl = table.Column<string>(type: "text", nullable: true),
                IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_Products", x => x.Id));

        migrationBuilder.CreateTable(
            name: "Orders",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                CustomerId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                CustomerEmail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                total_amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                shipping_street = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                shipping_number = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                shipping_complement = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                shipping_neighborhood = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                shipping_city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                shipping_state = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: true),
                shipping_zipcode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                PaymentChargeId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                TrackingCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_Orders", x => x.Id));

        migrationBuilder.CreateTable(
            name: "OrderItems",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                ProductName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                UnitPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                Quantity = table.Column<int>(type: "integer", nullable: false),
                OrderId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_OrderItems", x => x.Id);
                table.ForeignKey(name: "FK_OrderItems_Orders_OrderId", column: x => x.OrderId,
                    principalTable: "Orders", principalColumn: "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "OutboxMessages",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Type = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                Content = table.Column<string>(type: "text", nullable: false),
                OccurredOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                ProcessedOn = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                Error = table.Column<string>(type: "text", nullable: true),
                RetryCount = table.Column<int>(type: "integer", nullable: false, defaultValue: 0)
            },
            constraints: table => table.PrimaryKey("PK_OutboxMessages", x => x.Id));

        migrationBuilder.CreateIndex(name: "IX_Products_Category", table: "Products", column: "Category");
        migrationBuilder.CreateIndex(name: "IX_Products_IsActive", table: "Products", column: "IsActive");
        migrationBuilder.CreateIndex(name: "IX_Orders_CustomerId", table: "Orders", column: "CustomerId");
        migrationBuilder.CreateIndex(name: "IX_Orders_TrackingCode", table: "Orders", column: "TrackingCode",
            unique: true, filter: "\"TrackingCode\" IS NOT NULL");
        migrationBuilder.CreateIndex(name: "IX_OrderItems_OrderId", table: "OrderItems", column: "OrderId");
        migrationBuilder.CreateIndex(name: "IX_OutboxMessages_ProcessedOn_RetryCount",
            table: "OutboxMessages", columns: new[] { "ProcessedOn", "RetryCount" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "OrderItems");
        migrationBuilder.DropTable(name: "Orders");
        migrationBuilder.DropTable(name: "Products");
        migrationBuilder.DropTable(name: "OutboxMessages");
    }
}
