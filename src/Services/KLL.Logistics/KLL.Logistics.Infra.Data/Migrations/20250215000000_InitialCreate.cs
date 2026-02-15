using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace KLL.Logistics.Infra.Data.Migrations;

public partial class InitialCreate : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Shipments",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                RecipientName = table.Column<string>(type: "text", nullable: false),
                RecipientEmail = table.Column<string>(type: "text", nullable: false),
                TrackingCode = table.Column<string>(type: "text", nullable: false),
                Status = table.Column<int>(type: "integer", nullable: false),
                DestinationAddress = table.Column<string>(type: "text", nullable: false),
                DestinationCity = table.Column<string>(type: "text", nullable: false),
                DestinationState = table.Column<string>(type: "text", nullable: false),
                DestinationZipCode = table.Column<string>(type: "text", nullable: false),
                Weight = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                DriverId = table.Column<Guid>(type: "uuid", nullable: true),
                EstimatedDelivery = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                DeliveredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_Shipments", x => x.Id));

        migrationBuilder.CreateTable(
            name: "Drivers",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Name = table.Column<string>(type: "text", nullable: false),
                LicensePlate = table.Column<string>(type: "text", nullable: false),
                Phone = table.Column<string>(type: "text", nullable: false),
                IsAvailable = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table => table.PrimaryKey("PK_Drivers", x => x.Id));

        migrationBuilder.CreateTable(
            name: "TrackingEvents",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                Description = table.Column<string>(type: "text", nullable: false),
                Location = table.Column<string>(type: "text", nullable: false),
                Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                ShipmentId = table.Column<Guid>(type: "uuid", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_TrackingEvents", x => x.Id);
                table.ForeignKey(name: "FK_TrackingEvents_Shipments_ShipmentId", column: x => x.ShipmentId,
                    principalTable: "Shipments", principalColumn: "Id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "IX_Shipments_TrackingCode", table: "Shipments", column: "TrackingCode", unique: true);
        migrationBuilder.CreateIndex(name: "IX_Shipments_OrderId", table: "Shipments", column: "OrderId");
        migrationBuilder.CreateIndex(name: "IX_TrackingEvents_ShipmentId", table: "TrackingEvents", column: "ShipmentId");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "TrackingEvents");
        migrationBuilder.DropTable(name: "Drivers");
        migrationBuilder.DropTable(name: "Shipments");
    }
}
