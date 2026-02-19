using System.Diagnostics;
using System.Net.Sockets;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class SystemController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<SystemController> _logger;
    private static readonly DateTime _startTime = DateTime.UtcNow;

    public SystemController(IConfiguration config, IHttpClientFactory httpClientFactory, ILogger<SystemController> logger)
    {
        _config = config;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(CancellationToken ct)
    {
        var isDocker = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Docker";

        var storeHost = isDocker ? "store-api" : "localhost";
        var payHost = isDocker ? "pay-api" : "localhost";
        var logisticsHost = isDocker ? "logistics-api" : "localhost";
        var gatewayHost = isDocker ? "gateway" : "localhost";
        var postgresHost = isDocker ? "postgres" : "localhost";
        var redisHost = isDocker ? "redis" : "localhost";
        var rabbitmqHost = isDocker ? "rabbitmq" : "localhost";
        var kafkaHost = isDocker ? "kafka" : "localhost";
        var keycloakHost = isDocker ? "keycloak" : "localhost";
        var seqHost = isDocker ? "seq" : "localhost";
        var krtHost = isDocker ? "host.docker.internal" : "localhost";

        var postgresPort = isDocker ? 5432 : 5434;
        var redisPort = isDocker ? 6379 : 6381;
        var rabbitmqPort = isDocker ? 5672 : 5673;
        var rabbitmqMgmtPort = isDocker ? 15672 : 15673;
        var kafkaPort = isDocker ? 9092 : 39092;
        var keycloakPort = isDocker ? 8080 : 8083;
        var seqPort = isDocker ? 80 : 8082;

        var checks = new List<Task<ServiceStatus>>
        {
            CheckHttp("KLL Gateway", gatewayHost, 5100, "/health", "YARP Reverse Proxy", "Core"),
            CheckHttp("KLL Store API", storeHost, 5200, "/health", "Produtos, Pedidos, Categorias", "Core"),
            CheckHttp("KLL Pay API", payHost, 5300, "/health", "Pagamentos, Integração KRT", "Core"),
            CheckHttp("KLL Logistics API", logisticsHost, 5400, "/health", "Envios, Rastreamento", "Core"),
            CheckTcp("PostgreSQL", postgresHost, postgresPort, "Banco de dados principal", "Infraestrutura"),
            CheckTcp("Redis", redisHost, redisPort, "Cache distribuído", "Infraestrutura"),
            CheckTcp("RabbitMQ", rabbitmqHost, rabbitmqPort, "Mensageria", "Infraestrutura"),
            CheckTcp("Kafka", kafkaHost, kafkaPort, "Event streaming", "Infraestrutura"),
            CheckHttp("Keycloak", keycloakHost, keycloakPort, "/realms/master", "Autenticação IAM", "Infraestrutura"),
            CheckHttp("Seq", seqHost, seqPort, "/", "Logging/Observabilidade", "Infraestrutura"),
        };

        var krtCheck = CheckKrtIntegration(krtHost, ct);

        await Task.WhenAll(checks.Concat(new[] { krtCheck.ContinueWith(_ => (ServiceStatus)null!, ct) }));

        var services = checks.Select(t => t.Result).ToList();

        // KRT Bank como serviço
        var krtResult = await krtCheck;
        services.Add(new ServiceStatus
        {
            Name = "KRT Gateway",
            Host = krtHost,
            Port = 5000,
            Status = krtResult.Available ? "Online" : "Offline",
            ResponseTimeMs = krtResult.ResponseTimeMs,
            Description = "KRT Bank Gateway",
            Category = "Integração"
        });

        var online = services.Count(s => s.Status == "Online");
        var total = services.Count;

        return Ok(new
        {
            services,
            metrics = new
            {
                totalServices = total,
                onlineCount = online,
                offlineCount = total - online,
                uptimePercent = total > 0 ? Math.Round(online * 100.0 / total, 1) : 0,
                avgResponseTimeMs = Math.Round(services.Where(s => s.Status == "Online").DefaultIfEmpty().Average(s => s?.ResponseTimeMs ?? 0), 0)
            },
            krtIntegration = new
            {
                krtResult.Available,
                krtResult.Methods,
                krtResult.ResponseTimeMs
            },
            checkedAt = DateTime.UtcNow
        });
    }

    private async Task<ServiceStatus> CheckHttp(string name, string host, int port, string path, string description, string category)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(3);
            var response = await client.GetAsync($"http://{host}:{port}{path}");
            sw.Stop();
            return new ServiceStatus
            {
                Name = name,
                Host = host,
                Port = port,
                Status = response.IsSuccessStatusCode ? "Online" : "Offline",
                ResponseTimeMs = sw.ElapsedMilliseconds,
                Description = description,
                Category = category
            };
        }
        catch
        {
            sw.Stop();
            return new ServiceStatus
            {
                Name = name,
                Host = host,
                Port = port,
                Status = "Offline",
                ResponseTimeMs = sw.ElapsedMilliseconds,
                Description = description,
                Category = category
            };
        }
    }

    private async Task<ServiceStatus> CheckTcp(string name, string host, int port, string description, string category)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            using var tcp = new TcpClient();
            var connectTask = tcp.ConnectAsync(host, port);
            var completed = await Task.WhenAny(connectTask, Task.Delay(3000));
            sw.Stop();

            return new ServiceStatus
            {
                Name = name,
                Host = host,
                Port = port,
                Status = completed == connectTask && tcp.Connected ? "Online" : "Offline",
                ResponseTimeMs = sw.ElapsedMilliseconds,
                Description = description,
                Category = category
            };
        }
        catch
        {
            sw.Stop();
            return new ServiceStatus
            {
                Name = name,
                Host = host,
                Port = port,
                Status = "Offline",
                ResponseTimeMs = sw.ElapsedMilliseconds,
                Description = description,
                Category = category
            };
        }
    }

    private async Task<KrtIntegrationResult> CheckKrtIntegration(string krtHost, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(3);
            var response = await client.GetAsync($"http://{krtHost}:5000/api/v1/health", ct);
            sw.Stop();

            if (response.IsSuccessStatusCode)
            {
                return new KrtIntegrationResult
                {
                    Available = true,
                    Methods = new[] { "pix", "boleto", "credit_card" },
                    ResponseTimeMs = sw.ElapsedMilliseconds
                };
            }
        }
        catch { sw.Stop(); }

        return new KrtIntegrationResult
        {
            Available = false,
            Methods = Array.Empty<string>(),
            ResponseTimeMs = sw.ElapsedMilliseconds
        };
    }

    private class ServiceStatus
    {
        public string Name { get; set; } = "";
        public string Host { get; set; } = "";
        public int Port { get; set; }
        public string Status { get; set; } = "Offline";
        public long ResponseTimeMs { get; set; }
        public string Description { get; set; } = "";
        public string Category { get; set; } = "";
    }

    private class KrtIntegrationResult
    {
        public bool Available { get; set; }
        public string[] Methods { get; set; } = Array.Empty<string>();
        public long ResponseTimeMs { get; set; }
    }
}
