namespace KLL.Pay.Api.Handlers;

public class KrtApiKeyHandler : DelegatingHandler
{
    private readonly IConfiguration _config;

    public KrtApiKeyHandler(IConfiguration config) => _config = config;

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var apiKey = _config["KrtBank:ApiKey"] ?? "krt-dev-key-2026";
        request.Headers.Add("X-Api-Key", apiKey);
        return base.SendAsync(request, cancellationToken);
    }
}
