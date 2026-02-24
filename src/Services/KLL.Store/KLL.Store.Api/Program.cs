using System.Text;
using Amazon.S3;
using KLL.BuildingBlocks.Domain.Outbox;
using KLL.BuildingBlocks.Infrastructure.Auth;
using KLL.BuildingBlocks.Infrastructure.Extensions;
using KLL.BuildingBlocks.Infrastructure.Middleware;
using KLL.BuildingBlocks.Infrastructure.Persistence;
using KLL.Store.Api.Consumers;
using KLL.Store.Api.Services;
using KLL.BuildingBlocks.EventBus.Outbox;
using KLL.Store.Application.Commands.CreateProduct;
using KLL.Store.Application.Interfaces;
using KLL.Store.Application.Options;
using KLL.Store.Application.Services;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Enums;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using KLL.Store.Infra.Data.Repositories;
using KLL.Store.Infra.Data.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();
builder.Host.UseSerilog();

builder.Services.AddHttpClient();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Auth — JWT (dual: Keycloak + custom JWT)
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Key not configured");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "KLL.Store";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "KLL.Platform";
var keycloakAuthority = builder.Configuration["Keycloak:Authority"] ?? "http://localhost:8083/realms/kll-platform";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = keycloakAuthority;
        options.Audience = builder.Configuration["Keycloak:Audience"] ?? "account";
        options.RequireHttpsMetadata = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = false,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            RoleClaimType = System.Security.Claims.ClaimTypes.Role,
            NameClaimType = System.Security.Claims.ClaimTypes.Name
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Log.Error("Store Auth Failed: {Message}", context.Exception.Message);
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                var claims = context.Principal?.Claims.Select(c => $"{c.Type}={c.Value}");
                Log.Debug("Token validated. Claims: {Claims}", string.Join(", ", claims ?? Array.Empty<string>()));
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(opt =>
{
    opt.AddPolicy("AdminOnly", p => p.RequireRole("admin", "Administrador"));
    opt.AddPolicy("StaffOnly", p => p.RequireRole("admin", "Administrador", "tecnico", "Tecnico"));
    opt.AddPolicy("CustomerOnly", p => p.RequireRole("customer", "cliente", "Cliente"));
});

// Database
builder.Services.AddDbContext<StoreDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IAddressRepository, AddressRepository>();
builder.Services.AddScoped<IUserProfileRepository, UserProfileRepository>();
builder.Services.AddScoped<IFavoriteRepository, FavoriteRepository>();
builder.Services.AddScoped<IAppUserRepository, AppUserRepository>();

// Email
builder.Services.AddScoped<IEmailService, GmailEmailService>();

// Outbox
builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<StoreDbContext>());
builder.Services.AddScoped<IOutboxRepository, OutboxRepository>();
builder.Services.AddHostedService<OutboxProcessor>();

// Services
builder.Services.AddScoped<IOrderService, OrderService>();

// Shipping
builder.Services.AddSingleton<KLL.Store.Application.Services.ShippingService>();

// Backblaze B2 (S3-compatible)
builder.Services.Configure<BackblazeB2Options>(builder.Configuration.GetSection(BackblazeB2Options.Section));
var b2 = builder.Configuration.GetSection(BackblazeB2Options.Section).Get<BackblazeB2Options>();
if (b2 is not null && !string.IsNullOrEmpty(b2.Endpoint))
{
    builder.Services.AddSingleton<IAmazonS3>(new AmazonS3Client(
        b2.KeyId, b2.ApplicationKey,
        new AmazonS3Config { ServiceURL = b2.Endpoint, ForcePathStyle = true }));
    builder.Services.AddScoped<IImageUploadService, BackblazeB2UploadService>();
}

// Infrastructure (MediatR, Kafka, RabbitMQ, Redis, HealthChecks, Polly)
builder.Services.AddKllBuildingBlocks(builder.Configuration, "KLL.Store",
    typeof(CreateProductCommand).Assembly);

// Kafka consumers
builder.Services.AddHostedService<PaymentConfirmedConsumer>();
builder.Services.AddHostedService<ShipmentCreatedConsumer>();

// CORS (configurável via appsettings ou default)
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? new[] {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4200",
        "https://store.klisteneslima.dev",
        "https://admin.klisteneslima.dev",
        "https://bank.klisteneslima.dev",
        "https://api-kll.klisteneslima.dev"
    };
builder.Services.AddCors(opt => opt.AddPolicy("CorsPolicy", p =>
    p.WithOrigins(allowedOrigins)
     .AllowAnyMethod().AllowAnyHeader().AllowCredentials()));

var app = builder.Build();

// Auto migrate + seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
    if (db.Database.IsRelational())
        await db.Database.MigrateAsync();
    else
        await db.Database.EnsureCreatedAsync();

    // Seed categories and products if empty
    if (!await db.Categories.AnyAsync())
    {
        var catAneis = new Category("Anéis", "Anéis em ouro e pedras preciosas");
        var catColares = new Category("Colares", "Colares e correntes finas");
        var catBrincos = new Category("Brincos", "Brincos artesanais e clássicos");
        var catPulseiras = new Category("Pulseiras", "Pulseiras em ouro e prata");
        var catAliancas = new Category("Alianças", "Alianças de casamento e noivado");
        var catRelogios = new Category("Relógios", "Relógios de luxo");
        db.Categories.AddRange(catAneis, catColares, catBrincos, catPulseiras, catAliancas, catRelogios);
        await db.SaveChangesAsync();

        var products = new[]
        {
            Product.Create("Anel Solitário Eternité", "Anel solitário em ouro 18k com diamante central de 0.30ct", 4890m, 15, "Anéis", catAneis.Id, "/products/2da5e9f36ede4f16ba975b9c8604a361_solitario-diamante-brilhante-0-5ct.jpg"),
            Product.Create("Colar Riviera Diamantes", "Colar riviera com 25 diamantes naturais em ouro branco 18k", 15900m, 5, "Colares", catColares.Id, "/products/colar-riviera-diamantes.jpg"),
            Product.Create("Brinco Argola Ouro 18k", "Brinco argola clássico em ouro amarelo 18k polido", 1290m, 30, "Brincos", catBrincos.Id, "/products/7dadfec3bfd54def9260971f5ed4c562_argolas-ouro-18k-classicas-30mm.jpg"),
            Product.Create("Pulseira Tennis Safiras", "Pulseira tennis em ouro 18k com safiras azuis naturais", 8750m, 8, "Pulseiras", catPulseiras.Id, "/products/f51e23e407ab41a5ba1f1845eccfd41d_pulseira-tennis-safiras-e-diamantes.jpg"),
            Product.Create("Aliança Clássica Ouro 18k", "Aliança reta clássica em ouro amarelo 18k, 4mm", 890m, 50, "Alianças", catAliancas.Id, "/products/97fd27fc159a4a419d34bfdbbcd20ed9_par-aliancas-ouro-amarelo-classica.jpg"),
            Product.Create("Relógio Automático Heritage", "Relógio automático com caixa em aço e pulseira de couro", 12500m, 10, "Relógios", catRelogios.Id, "/products/dress-watch-ouro-amarelo.jpg"),
        };
        db.Products.AddRange(products);
        await db.SaveChangesAsync();
        Log.Information("[KLL.Store] Seed data: {CatCount} categories, {ProdCount} products created", 6, products.Length);
    }

    // Seed demo orders if empty
    if (!await db.Orders.AnyAsync())
    {
        var allProducts = await db.Products.ToListAsync();
        if (allProducts.Count >= 6)
        {
            var addr = new KLL.BuildingBlocks.Domain.ValueObjects.Address(
                "Rua Augusta", "1508", "Sala 42", "Consolação", "São Paulo", "SP", "01304001");
            var customers = new (string id, string email)[]
            {
                ("c0000001-0000-0000-0000-000000000001", "ana.silva@email.com"),
                ("c0000001-0000-0000-0000-000000000002", "bruno.costa@email.com"),
                ("c0000001-0000-0000-0000-000000000003", "camila.lima@email.com"),
                ("c0000001-0000-0000-0000-000000000004", "daniel.souza@email.com"),
                ("c0000001-0000-0000-0000-000000000005", "eduarda.rocha@email.com"),
            };

            var orders = new List<Order>();

            // Order 1 — Delivered
            var o1 = Order.Create(customers[0].id, customers[0].email, addr);
            o1.AddItem(allProducts[0].Id, allProducts[0].Name, allProducts[0].Price, 1);
            o1.AddItem(allProducts[2].Id, allProducts[2].Name, allProducts[2].Price, 2);
            o1.ConfirmPayment("pay-seed-001");
            o1.SetShipped("KLL2026SP0001");
            o1.SetDelivered();
            orders.Add(o1);

            // Order 2 — Shipped
            var o2 = Order.Create(customers[1].id, customers[1].email, addr);
            o2.AddItem(allProducts[1].Id, allProducts[1].Name, allProducts[1].Price, 1);
            o2.ConfirmPayment("pay-seed-002");
            o2.SetShipped("KLL2026SP0002");
            orders.Add(o2);

            // Order 3 — Paid
            var o3 = Order.Create(customers[2].id, customers[2].email, addr);
            o3.AddItem(allProducts[3].Id, allProducts[3].Name, allProducts[3].Price, 1);
            o3.AddItem(allProducts[4].Id, allProducts[4].Name, allProducts[4].Price, 2);
            o3.ConfirmPayment("pay-seed-003");
            orders.Add(o3);

            // Order 4 — Pending
            var o4 = Order.Create(customers[3].id, customers[3].email, addr);
            o4.AddItem(allProducts[5].Id, allProducts[5].Name, allProducts[5].Price, 1);
            orders.Add(o4);

            // Order 5 — Pending
            var o5 = Order.Create(customers[4].id, customers[4].email, addr);
            o5.AddItem(allProducts[0].Id, allProducts[0].Name, allProducts[0].Price, 1);
            o5.AddItem(allProducts[1].Id, allProducts[1].Name, allProducts[1].Price, 1);
            orders.Add(o5);

            // Order 6 — Cancelled
            var o6 = Order.Create(customers[0].id, customers[0].email, addr);
            o6.AddItem(allProducts[4].Id, allProducts[4].Name, allProducts[4].Price, 3);
            o6.Cancel();
            orders.Add(o6);

            db.Orders.AddRange(orders);
            await db.SaveChangesAsync();
            Log.Information("[KLL.Store] Seeded {Count} demo orders", orders.Count);
        }
    }

    // Seed admin user
    var userRepo = scope.ServiceProvider.GetRequiredService<IAppUserRepository>();
    var existingAdmin = await userRepo.GetByEmailAsync("admin@aureamaison.com.br");
    if (existingAdmin == null)
    {
        var admin = AppUser.Create("Administrador AUREA", "admin@aureamaison.com.br", "00000000000",
            BCrypt.Net.BCrypt.HashPassword("Admin@KLL2026"));
        admin.ConfirmEmail();
        admin.Approve("SYSTEM_SEED");
        admin.ChangeRole(UserRole.Administrador);
        await userRepo.AddAsync(admin);
        Log.Information("[KLL.Store] Admin seed created: admin@aureamaison.com.br");
    }

    // Seed tecnico user
    var existingTecnico = await userRepo.GetByEmailAsync("tecnico01@aureamaison.com.br");
    if (existingTecnico == null)
    {
        var tecnico = AppUser.Create("Técnico AUREA", "tecnico01@aureamaison.com.br", "99999999999",
            BCrypt.Net.BCrypt.HashPassword("Tech@KLL2026"));
        tecnico.ConfirmEmail();
        tecnico.Approve("SYSTEM_SEED");
        tecnico.ChangeRole(UserRole.Tecnico);
        await userRepo.AddAsync(tecnico);
        await db.SaveChangesAsync();
        Log.Information("[KLL.Store] Tecnico seed created: tecnico01@aureamaison.com.br");
    }

    // Seed demo users for admin testing
    var firstDemo = await userRepo.GetByEmailAsync("ana.silva@aureamaison.com.br");
    if (firstDemo == null)
    {
        var demoHash = BCrypt.Net.BCrypt.HashPassword("Demo@2026");
        var demoUsers = new (string name, string email, string cpf, bool active)[]
        {
            ("Ana Clara Silva", "ana.silva@aureamaison.com.br", "11111111111", true),
            ("Bruno Costa Santos", "bruno.costa@aureamaison.com.br", "22222222222", true),
            ("Camila Oliveira Lima", "camila.oliveira@aureamaison.com.br", "33333333333", true),
            ("Daniel Pereira Souza", "daniel.pereira@aureamaison.com.br", "44444444444", false),
            ("Eduarda Santos Rocha", "eduarda.santos@aureamaison.com.br", "55555555555", false),
        };
        foreach (var (name, email, cpf, active) in demoUsers)
        {
            var u = AppUser.Create(name, email, cpf, demoHash);
            u.ConfirmEmail();
            if (active) u.Approve("SYSTEM_SEED");
            await userRepo.AddAsync(u);
        }
        Log.Information("[KLL.Store] Seeded {Count} demo users", demoUsers.Length);
    }
}

app.UseCors("CorsPolicy");
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<CorrelationIdMiddleware>();

if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == "Docker")
    { app.UseSwagger(); app.UseSwaggerUI(); }

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

Log.Information("[KLL.Store] Started on port {Port}", builder.Configuration["ASPNETCORE_URLS"] ?? "5200");
app.Run();

// Required for WebApplicationFactory in integration tests
public partial class Program { }
