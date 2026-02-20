using Microsoft.Extensions.Hosting;
using Serilog;
using Serilog.Events;

namespace KLL.BuildingBlocks.Infrastructure.Logging;

public static class SerilogExtensions
{
    public static IHostBuilder UseKllSerilog(this IHostBuilder hostBuilder, string serviceName)
    {
        return hostBuilder.UseSerilog((context, config) =>
        {
            config
                .MinimumLevel.Information()
                .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
                .MinimumLevel.Override("System", LogEventLevel.Warning)
                .Enrich.FromLogContext()
                .Enrich.WithMachineName()
                .Enrich.WithThreadId()
                .Enrich.WithProperty("Service", serviceName)
                .WriteTo.Console(outputTemplate:
                    "[{Timestamp:HH:mm:ss} {Level:u3}] [{Service}] {CorrelationId} {Message:lj}{NewLine}{Exception}")
                .WriteTo.Seq(
                    context.Configuration["Seq:Url"] ?? "http://localhost:5342",
                    restrictedToMinimumLevel: LogEventLevel.Information);
        });
    }
}
