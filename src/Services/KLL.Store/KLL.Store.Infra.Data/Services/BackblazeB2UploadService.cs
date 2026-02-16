using Amazon.S3;
using Amazon.S3.Model;
using KLL.Store.Application.Interfaces;
using KLL.Store.Application.Options;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace KLL.Store.Infra.Data.Services;

public class BackblazeB2UploadService : IImageUploadService
{
    private readonly IAmazonS3 _s3;
    private readonly BackblazeB2Options _options;
    private readonly ILogger<BackblazeB2UploadService> _logger;

    public BackblazeB2UploadService(IAmazonS3 s3, IOptions<BackblazeB2Options> options, ILogger<BackblazeB2UploadService> logger)
    {
        _s3 = s3;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default)
    {
        var key = $"products/{Guid.NewGuid():N}_{fileName}";

        var request = new PutObjectRequest
        {
            BucketName = _options.BucketName,
            Key = key,
            InputStream = fileStream,
            ContentType = contentType,
            CannedACL = S3CannedACL.PublicRead
        };

        await _s3.PutObjectAsync(request, ct);
        _logger.LogInformation("Image uploaded to B2: {Key}", key);

        return $"{_options.PublicUrl}/{key}";
    }
}
