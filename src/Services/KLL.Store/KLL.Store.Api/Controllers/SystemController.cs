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
        var storefrontHost = isDocker ? "storefront" : "localhost";
        var adminHost = isDocker ? "admin-web" : "localhost";
        var postgresHost = isDocker ? "shared-postgres" : "localhost";
        var redisHost = isDocker ? "shared-redis" : "localhost";
        var rabbitmqHost = isDocker ? "shared-rabbitmq" : "localhost";
        var kafkaHost = isDocker ? "shared-kafka" : "localhost";
        var keycloakHost = isDocker ? "shared-keycloak" : "localhost";
        var seqHost = isDocker ? "kll-seq" : "localhost";
        var krtHost = isDocker ? "krt-gateway" : "localhost";

        var storefrontPort = isDocker ? 80 : 5174;
        var adminPort = isDocker ? 80 : 5173;
        var postgresPort = isDocker ? 5432 : 5434;
        var redisPort = isDocker ? 6379 : 6381;
        var rabbitmqPort = isDocker ? 5672 : 5673;
        var kafkaPort = isDocker ? 9092 : 39092;
        var keycloakPort = isDocker ? 8080 : 8083;
        var seqPort = isDocker ? 80 : 8082;

        var checks = new List<Task<ServiceStatus>>
        {
            CheckHttp("KLL Gateway", gatewayHost, 5100, 5100, "/health", "YARP Reverse Proxy", "Core"),
            CheckHttp("KLL Store API", storeHost, 5200, 5200, "/health", "Produtos, Pedidos, Categorias", "Core"),
            CheckHttp("KLL Pay API", payHost, 5300, 5300, "/health", "Pagamentos \u00b7 Anti-Corruption Layer", "Core"),
            CheckHttp("KLL Logistics API", logisticsHost, 5400, 5400, "/health", "Envios, Rastreamento", "Core"),
            CheckHttp("KLL Storefront", storefrontHost, storefrontPort, 5174, "/", "React/Vite \u00b7 Loja do Cliente", "Core"),
            CheckHttp("KLL Admin Web", adminHost, adminPort, 5173, "/", "React \u00b7 Painel Administrativo", "Core"),
            CheckTcp("PostgreSQL", postgresHost, postgresPort, 5434, "Banco de Dados v16", "Infraestrutura"),
            CheckTcp("Redis", redisHost, redisPort, 6381, "Cache \u00b7 Sess\u00f5es", "Infraestrutura"),
            CheckTcp("RabbitMQ", rabbitmqHost, rabbitmqPort, 5673, "Mensageria \u00b7 AMQP", "Infraestrutura"),
            CheckTcp("Kafka", kafkaHost, kafkaPort, 39092, "Event Streaming", "Infraestrutura"),
            CheckHttp("Keycloak", keycloakHost, keycloakPort, 8083, "/realms/master", "Autentica\u00e7\u00e3o \u00b7 OAuth2/OIDC", "Infraestrutura"),
            CheckHttp("Seq", seqHost, seqPort, 8082, "/", "Logging \u00b7 Observabilidade", "Infraestrutura"),
        };

        var krtPort = isDocker ? 80 : 5000;

        var krtCheck = CheckKrtIntegration(krtHost, krtPort, ct);

        await Task.WhenAll(checks.Concat(new[] { krtCheck.ContinueWith(_ => (ServiceStatus)null!, ct) }));

        var services = checks.Select(t => t.Result).ToList();

        var krtResult = await krtCheck;
        services.Add(new ServiceStatus
        {
            Name = "KRT Gateway",
            Host = krtHost,
            Port = krtPort,
            ExternalPort = 5000,
            Status = krtResult.Available ? "Online" : "Offline",
            ResponseTimeMs = krtResult.ResponseTimeMs,
            Description = "Integra\u00e7\u00e3o Banc\u00e1ria",
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

    private async Task<ServiceStatus> CheckHttp(string name, string host, int port, int externalPort, string path, string description, string category)
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
                Name = name, Host = host, Port = port, ExternalPort = externalPort,
                Status = response.IsSuccessStatusCode ? "Online" : "Offline",
                ResponseTimeMs = sw.ElapsedMilliseconds, Description = description, Category = category
            };
        }
        catch
        {
            sw.Stop();
            return new ServiceStatus
            {
                Name = name, Host = host, Port = port, ExternalPort = externalPort,
                Status = "Offline", ResponseTimeMs = sw.ElapsedMilliseconds,
                Description = description, Category = category
            };
        }
    }

    private async Task<ServiceStatus> CheckTcp(string name, string host, int port, int externalPort, string description, string category)
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
                Name = name, Host = host, Port = port, ExternalPort = externalPort,
                Status = completed == connectTask && tcp.Connected ? "Online" : "Offline",
                ResponseTimeMs = sw.ElapsedMilliseconds, Description = description, Category = category
            };
        }
        catch
        {
            sw.Stop();
            return new ServiceStatus
            {
                Name = name, Host = host, Port = port, ExternalPort = externalPort,
                Status = "Offline", ResponseTimeMs = sw.ElapsedMilliseconds,
                Description = description, Category = category
            };
        }
    }

    private async Task<KrtIntegrationResult> CheckKrtIntegration(string krtHost, int krtPort, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(3);
            var response = await client.GetAsync($"http://{krtHost}:{krtPort}/api/v1/health", ct);
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
        public int ExternalPort { get; set; }
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
