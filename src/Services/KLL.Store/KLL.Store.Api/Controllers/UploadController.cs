using KLL.Store.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/upload")]
[Authorize(Policy = "AdminOnly")]
public class UploadController : ControllerBase
{
    private readonly IImageUploadService _uploadService;
    private static readonly HashSet<string> AllowedTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "image/gif"
    };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5 MB

    public UploadController(IImageUploadService uploadService)
    {
        _uploadService = uploadService;
    }

    [HttpPost("image")]
    [RequestSizeLimit(MaxFileSize)]
    public async Task<IActionResult> UploadImage(IFormFile file, CancellationToken ct)
    {
        if (file.Length == 0)
            return BadRequest("Arquivo vazio");

        if (file.Length > MaxFileSize)
            return BadRequest("Arquivo excede o limite de 5MB");

        if (!AllowedTypes.Contains(file.ContentType))
            return BadRequest("Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.");

        await using var stream = file.OpenReadStream();
        var url = await _uploadService.UploadAsync(stream, file.FileName, file.ContentType, ct);

        return Ok(new { url });
    }
}
