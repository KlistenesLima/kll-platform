using Amazon.S3;
using Amazon.S3.Model;
using KLL.Store.Application.Interfaces;
using KLL.Store.Application.Options;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace KLL.Store.Infra.Data.Services;

public class BackblazeB2UploadService : IImageUploadService
{
    private readonly IAmazonS3 _s3;
    private readonly BackblazeB2Options _options;
    private readonly ILogger<BackblazeB2UploadService> _logger;
    private readonly string? _localBasePath;

    public BackblazeB2UploadService(IAmazonS3 s3, IOptions<BackblazeB2Options> options,
        ILogger<BackblazeB2UploadService> logger, IConfiguration configuration)
    {
        _s3 = s3;
        _options = options.Value;
        _logger = logger;
        _localBasePath = configuration["LocalStorage:BasePath"];
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
    {
        var key = $"products/{Guid.NewGuid():N}_{fileName}";

        // Buffer the stream so we can use it twice (B2 + local)
        using var memoryStream = new MemoryStream();
        await fileStream.CopyToAsync(memoryStream, ct);
        memoryStream.Position = 0;

        // 1. Upload to B2 (master)
        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = key,
            InputStream = memoryStream,
            ContentType = contentType,
            CannedACL = S3CannedACL.PublicRead
        };

        await _s3.PutObjectAsync(request, ct);
        _logger.LogInformation("Image uploaded to B2: {Key}", key);

        // 2. Save locally (best-effort, never blocks)
        await SaveLocalAsync(memoryStream, key, ct);

        return $"{_options.PublicUrl}/{key}";
    }

    private async Task SaveLocalAsync(MemoryStream source, string key, CancellationToken ct)
    {
        if (string.IsNullOrEmpty(_localBasePath)) return;

        try
        {
            var filename = Path.GetFileName(key);
            var localPath = Path.Combine(_localBasePath, filename);
            Directory.CreateDirectory(_localBasePath);

            source.Position = 0;
            await using var fileStream = new FileStream(localPath, FileMode.Create, FileAccess.Write);
            await source.CopyToAsync(fileStream, ct);

            _logger.LogInformation("Image saved locally: {Path}", localPath);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to save image locally for key {Key} — B2 upload succeeded", key);
        }
    }
}
