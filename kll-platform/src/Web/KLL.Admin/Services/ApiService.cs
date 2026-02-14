using System.Net.Http.Json;

namespace KLL.Admin.Services;

public class ApiService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public ApiService(IHttpClientFactory httpClientFactory) => _httpClientFactory = httpClientFactory;

    public async Task<T?> GetAsync<T>(string clientName, string endpoint)
    {
        var client = _httpClientFactory.CreateClient(clientName);
        return await client.GetFromJsonAsync<T>(endpoint);
    }

    public async Task<bool> HealthCheckAsync(string clientName)
    {
        try
        {
            var client = _httpClientFactory.CreateClient(clientName);
            var response = await client.GetAsync("/health");
            return response.IsSuccessStatusCode;
        }
        catch { return false; }
    }
}