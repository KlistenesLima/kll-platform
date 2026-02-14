using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.BuildingBlocks.EventBus.Kafka;
using KLL.BuildingBlocks.Infrastructure.Logging;
using KLL.BuildingBlocks.Infrastructure.Middleware;
using KLL.BuildingBlocks.Infrastructure.Resilience;
using KLL.BuildingBlocks.Outbox;
using KLL.Pay.Api.Consumers;
using KLL.Pay.Application.Integration;
using KLL.Pay.Application.Services;
using KLL.Pay.Domain.Interfaces;
using KLL.Pay.Infra.Data.Context;
using KLL.Pay.Infra.Data.Repositories;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseKllSerilog("KLL.Pay");

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "KLL Pay API", Version = "v1" });
});

builder.Services.AddDbContext<PayDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<DbContext>(sp => sp.GetRequiredService<PayDbContext>());

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(TransactionService).Assembly));

builder.Services.AddScoped<IMerchantRepository, MerchantRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<MerchantService>();
builder.Services.AddScoped<TransactionService>();

builder.Services.AddHttpClient<KrtBankClient>(c =>
{
    c.BaseAddress = new Uri(builder.Configuration["KrtBank:BaseUrl"] ?? "http://localhost:5002");
    c.Timeout = TimeSpan.FromSeconds(30);
}).AddResiliencePolicies();

builder.Services.AddSingleton<IEventBus, KafkaEventBus>();
builder.Services.AddSignalR();
builder.Services.AddStackExchangeRedisCache(opt =>
{
    opt.Configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6381";
    opt.InstanceName = "kll:";
});
builder.Services.AddHostedService<OutboxProcessor>();
builder.Services.AddHealthChecks();

builder.Services.AddHostedService<OrderCreatedConsumer>();
builder.Services.AddHostedService<BankPaymentConfirmedConsumer>();

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173", "http://localhost:5100")
     .AllowAnyMethod().AllowAnyHeader().AllowCredentials()));

var app = builder.Build();
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<ExceptionMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors();
app.MapControllers();
app.MapHealthChecks("/health");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PayDbContext>();
    await db.Database.MigrateAsync();
}

Log.Information("KLL.Pay API started on port 5300");
app.Run();
