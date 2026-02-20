namespace KLL.Store.Application.Interfaces;

public interface IImageUploadService
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken ct = default);
}
