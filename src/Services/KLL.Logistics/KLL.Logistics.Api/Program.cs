using KLL.BuildingBlocks.Infrastructure.Extensions;
using KLL.BuildingBlocks.Infrastructure.Logging;
using KLL.BuildingBlocks.Infrastructure.Middleware;
using KLL.Logistics.Api.Consumers;
using KLL.Logistics.Application.Services;
using KLL.Logistics.Domain.Interfaces;
using KLL.Logistics.Infra.Data.Context;
using KLL.Logistics.Infra.Data.Repositories;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseKllSerilog("KLL.Logistics");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "KLL Logistics API", Version = "v1", Description = "Shipment tracking & delivery microservice" });
});

builder.Services.AddDbContext<LogisticsDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IShipmentRepository, ShipmentRepository>();
builder.Services.AddScoped<IDriverRepository, DriverRepository>();
builder.Services.AddScoped<ShipmentService>();

builder.Services.AddKafkaEventBus();
builder.Services.AddRabbitMQNotifications();
builder.Services.AddRedisCache(builder.Configuration);
builder.Services.AddKLLHealthChecks(builder.Configuration);

builder.Services.AddHostedService<ShipmentRequestedConsumer>();

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173", "http://localhost:5100")
     .AllowAnyMethod().AllowAnyHeader().AllowCredentials()));

var app = builder.Build();
app.UseKllInfrastructure();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.MapControllers();
app.MapHealthChecks("/health");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LogisticsDbContext>();
    await db.Database.MigrateAsync();
}

Log.Information("KLL.Logistics API started on port 5400");
app.Run();
