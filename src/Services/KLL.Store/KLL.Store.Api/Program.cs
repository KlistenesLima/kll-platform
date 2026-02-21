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
var jwtKey = builder.Configuration["Jwt:Key"] ?? "KLL-Store-Super-Secret-Key-2026-Minimum-32-Chars!";
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

builder.Services.AddAuthorization();

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
            Product.Create("Anel Solitário Eternité", "Anel solitário em ouro 18k com diamante central de 0.30ct", 4890m, 15, "Anéis", catAneis.Id),
            Product.Create("Colar Riviera Diamantes", "Colar riviera com 25 diamantes naturais em ouro branco 18k", 15900m, 5, "Colares", catColares.Id),
            Product.Create("Brinco Argola Ouro 18k", "Brinco argola clássico em ouro amarelo 18k polido", 1290m, 30, "Brincos", catBrincos.Id),
            Product.Create("Pulseira Tennis Safiras", "Pulseira tennis em ouro 18k com safiras azuis naturais", 8750m, 8, "Pulseiras", catPulseiras.Id),
            Product.Create("Aliança Clássica Ouro 18k", "Aliança reta clássica em ouro amarelo 18k, 4mm", 890m, 50, "Alianças", catAliancas.Id),
            Product.Create("Relógio Automático Heritage", "Relógio automático com caixa em aço e pulseira de couro", 12500m, 10, "Relógios", catRelogios.Id),
        };
        db.Products.AddRange(products);
        await db.SaveChangesAsync();
        Log.Information("[KLL.Store] Seed data: {CatCount} categories, {ProdCount} products created", 6, products.Length);
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
        Log.Information("[KLL.Store] Admin seed created: admin@aureamaison.com.br / Admin@KLL2026");
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
