using Amazon.S3;
using KLL.BuildingBlocks.Domain.Outbox;
using KLL.BuildingBlocks.Infrastructure.Auth;
using KLL.BuildingBlocks.Infrastructure.Extensions;
using KLL.BuildingBlocks.Infrastructure.Middleware;
using KLL.BuildingBlocks.Infrastructure.Persistence;
using KLL.Store.Api.Consumers;
using KLL.BuildingBlocks.EventBus.Outbox;
using KLL.Store.Application.Commands.CreateProduct;
using KLL.Store.Application.Interfaces;
using KLL.Store.Application.Options;
using KLL.Store.Application.Services;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using KLL.Store.Infra.Data.Repositories;
using KLL.Store.Infra.Data.Services;
using Microsoft.EntityFrameworkCore;
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

// Auth
builder.Services.AddKllAuth(builder.Configuration);

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

// CORS
if (builder.Environment.IsProduction())
{
    builder.Services.AddCors(opt => opt.AddPolicy("CorsPolicy", p =>
        p.WithOrigins(
            "https://store.klisteneslima.dev",
            "https://admin.klisteneslima.dev",
            "https://api-kll.klisteneslima.dev")
         .AllowAnyMethod().AllowAnyHeader().AllowCredentials()));
}
else
{
    builder.Services.AddCors(opt => opt.AddPolicy("CorsPolicy", p =>
        p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));
}

var app = builder.Build();

// Auto migrate
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
    if (db.Database.IsRelational())
        await db.Database.MigrateAsync();
    else
        await db.Database.EnsureCreatedAsync();
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
