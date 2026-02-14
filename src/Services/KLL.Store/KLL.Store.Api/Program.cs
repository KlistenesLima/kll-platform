using KLL.BuildingBlocks.Domain.Outbox;
using KLL.BuildingBlocks.Infrastructure.Extensions;
using KLL.BuildingBlocks.Infrastructure.Logging;
using KLL.BuildingBlocks.Infrastructure.Persistence;
using KLL.BuildingBlocks.Infrastructure.SignalR;
using KLL.Store.Api.Consumers;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using KLL.Store.Infra.Data.Repositories;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseKllSerilog("KLL.Store");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "KLL Store API", Version = "v1",
        Description = "E-Commerce microservice Ã¢â‚¬â€ Products, Orders, Cart" });
});

// Database
builder.Services.AddDbContext<StoreDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOutboxRepository>(sp => new OutboxRepository(sp.GetRequiredService<StoreDbContext>()));

// BuildingBlocks (MediatR, Polly, Redis, Kafka, RabbitMQ, HealthChecks, FluentValidation)
builder.Services.AddKllBuildingBlocks(builder.Configuration, "store",
    typeof(KLL.Store.Application.Commands.CreateProduct.CreateProductCommand).Assembly);

// Kafka Consumers
builder.Services.AddHostedService<PaymentConfirmedConsumer>();
builder.Services.AddHostedService<ShipmentCreatedConsumer>();

// SignalR
builder.Services.AddSignalR();

// CORS
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173", "http://localhost:5100", "http://localhost:4200")
     .AllowAnyMethod().AllowAnyHeader().AllowCredentials()));

var app = builder.Build();
app.UseKllInfrastructure();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.MapControllers();
app.MapHub<OrderTrackingHub>("/hubs/order-tracking");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
    await db.Database.MigrateAsync();
}

Log.Information("KLL.Store started on {Urls}", builder.Configuration["Urls"]);
app.Run();

