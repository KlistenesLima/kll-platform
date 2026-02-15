using System.Diagnostics;
using MediatR;
using Microsoft.Extensions.Logging;

namespace KLL.BuildingBlocks.Infrastructure.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger) => _logger = logger;

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var requestName = typeof(TRequest).Name;
        _logger.LogInformation("[START] {Request}", requestName);
        var sw = Stopwatch.StartNew();

        try
        {
            var response = await next();
            sw.Stop();
            _logger.LogInformation("[END] {Request} completed in {Elapsed}ms", requestName, sw.ElapsedMilliseconds);
            return response;
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "[FAIL] {Request} failed after {Elapsed}ms", requestName, sw.ElapsedMilliseconds);
            throw;
        }
    }
}
