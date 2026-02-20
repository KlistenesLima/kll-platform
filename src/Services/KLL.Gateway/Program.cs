using System.Threading.RateLimiting;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5342")
    .Enrich.FromLogContext()
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();

builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10 MB
});

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
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
    options.AddPolicy("checkout", ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 5
            }));
});

if (builder.Environment.IsProduction())
{
    builder.Services.AddCors(o => o.AddPolicy("CorsPolicy", p =>
        p.WithOrigins(
            "https://store.klisteneslima.dev",
            "https://admin.klisteneslima.dev")
         .AllowAnyMethod().AllowAnyHeader().AllowCredentials()));
}
else
{
    builder.Services.AddCors(o => o.AddPolicy("CorsPolicy", p =>
        p.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:4200")
         .AllowAnyMethod().AllowAnyHeader().AllowCredentials()));
}

builder.Services.AddHealthChecks();

var app = builder.Build();
app.UseCors("CorsPolicy");
app.UseRateLimiter();

// Security headers
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    ctx.Response.Headers.Append("X-Frame-Options", "DENY");
    ctx.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    ctx.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    ctx.Response.Headers.Append("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    await next();
});

// Normalize URL paths to lowercase for case-insensitive routing
app.Use(async (context, next) =>
{
    if (context.Request.Path.HasValue)
        context.Request.Path = context.Request.Path.Value.ToLowerInvariant();
    await next();
});

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
