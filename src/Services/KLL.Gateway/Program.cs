using System.Threading.RateLimiting;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5342")
    .Enrich.FromLogContext()
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 10
            }));
    options.RejectionStatusCode = 429;
});

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:4200")
     .AllowAnyMethod().AllowAnyHeader().AllowCredentials()));

builder.Services.AddHealthChecks();

var app = builder.Build();
app.UseCors();
app.UseRateLimiter();
app.MapReverseProxy();
app.MapHealthChecks("/health");

// Aggregated health — resolve service hosts based on environment
var isDocker = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Docker";
var storeHost = isDocker ? "store-api" : "localhost";
var payHost = isDocker ? "pay-api" : "localhost";
var logisticsHost = isDocker ? "logistics-api" : "localhost";

app.MapGet("/health/all", async (HttpContext ctx) =>
{
    var client = new HttpClient { Timeout = TimeSpan.FromSeconds(5) };
    var services = new Dictionary<string, string>
    {
        ["store"] = $"http://{storeHost}:5200/health",
        ["pay"] = $"http://{payHost}:5300/health",
        ["logistics"] = $"http://{logisticsHost}:5400/health"
    };

    var results = new Dictionary<string, string>();
    foreach (var (name, url) in services)
    {
        try
        {
            var response = await client.GetAsync(url);
            results[name] = response.IsSuccessStatusCode ? "Healthy" : "Unhealthy";
        }
        catch { results[name] = "Unreachable"; }
    }

    var allHealthy = results.Values.All(v => v == "Healthy");
    ctx.Response.StatusCode = allHealthy ? 200 : 503;
    return results;
});

Log.Information("KLL.Gateway started on port 5100");
app.Run();
