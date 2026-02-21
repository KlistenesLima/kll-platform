using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KLL.Store.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFavoritesAndAppUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // AppUsers may already exist from a previous manual creation / EnsureCreated
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS ""AppUsers"" (
                    ""Id"" uuid NOT NULL,
                    ""FullName"" character varying(200) NOT NULL,
                    ""Email"" character varying(200) NOT NULL,
                    ""Document"" character varying(14) NOT NULL,
                    ""PasswordHash"" text NOT NULL,
                    ""Role"" character varying(20) NOT NULL,
                    ""Status"" character varying(30) NOT NULL,
                    ""EmailConfirmationCode"" character varying(6),
                    ""EmailConfirmationExpiry"" timestamp with time zone,
                    ""PasswordResetCode"" character varying(6),
                    ""PasswordResetExpiry"" timestamp with time zone,
                    ""ApprovedAt"" timestamp with time zone,
                    ""ApprovedBy"" character varying(200),
                    ""CreatedAt"" timestamp with time zone NOT NULL,
                    ""UpdatedAt"" timestamp with time zone,
                    CONSTRAINT ""PK_AppUsers"" PRIMARY KEY (""Id"")
                );
            ");

            migrationBuilder.CreateTable(
                name: "Favorites",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorites", x => x.Id);
                });

            migrationBuilder.Sql(@"CREATE UNIQUE INDEX IF NOT EXISTS ""IX_AppUsers_Document"" ON ""AppUsers"" (""Document"");");
            migrationBuilder.Sql(@"CREATE UNIQUE INDEX IF NOT EXISTS ""IX_AppUsers_Email"" ON ""AppUsers"" (""Email"");");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_CustomerId",
                table: "Favorites",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Favorites_CustomerId_ProductId",
                table: "Favorites",
                columns: new[] { "CustomerId", "ProductId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppUsers");

            migrationBuilder.DropTable(
                name: "Favorites");
        }
    }
}
