using KLL.Notifications.Worker;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.WithProperty("Service", "KLL.Notifications")
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5342")
    .CreateLogger();

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<EmailNotificationConsumer>();
builder.Services.AddHostedService<SmsNotificationConsumer>();
builder.Services.AddHostedService<PushNotificationConsumer>();
builder.Logging.ClearProviders();
builder.Logging.AddSerilog();

var host = builder.Build();
Log.Information("KLL.Notifications.Worker started");
host.Run();
