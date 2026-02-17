using KLL.BuildingBlocks.Infrastructure.Auth;
using KLL.Store.Application.Interfaces;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IUserProfileRepository _profileRepo;
    private readonly IImageUploadService _uploadService;

    public ProfileController(IUserProfileRepository profileRepo, IImageUploadService uploadService)
    {
        _profileRepo = profileRepo;
        _uploadService = uploadService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var profile = await _profileRepo.GetByCustomerIdAsync(userId);
        var userName = User.GetUserName() ?? "";
        var email = User.GetUserEmail() ?? "";

        return Ok(new
        {
            firstName = profile?.FirstName ?? userName,
            lastName = profile?.LastName ?? "",
            email,
            avatarUrl = profile?.AvatarUrl
        });
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateProfileRequest req)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var profile = await _profileRepo.GetByCustomerIdAsync(userId);
        if (profile is null)
        {
            profile = UserProfile.Create(userId, req.FirstName, req.LastName);
            await _profileRepo.AddAsync(profile);
        }
        else
        {
            profile.Update(req.FirstName, req.LastName);
        }

        await _profileRepo.SaveChangesAsync();

        return Ok(new
        {
            firstName = profile.FirstName,
            lastName = profile.LastName,
            email = User.GetUserEmail() ?? "",
            avatarUrl = profile.AvatarUrl
        });
    }

    [HttpPost("avatar")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadAvatar(IFormFile file, CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        if (file.Length == 0) return BadRequest("Arquivo vazio");

        var allowedTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg", "image/png", "image/webp", "image/gif"
        };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest("Tipo de arquivo nao permitido. Use JPEG, PNG, WebP ou GIF.");

        await using var stream = file.OpenReadStream();
        var url = await _uploadService.UploadAsync(stream, $"avatar_{userId}_{file.FileName}", file.ContentType, ct);

        var profile = await _profileRepo.GetByCustomerIdAsync(userId);
        if (profile is null)
        {
            var userName = User.GetUserName() ?? "";
            profile = UserProfile.Create(userId, userName, "");
            profile.SetAvatar(url);
            await _profileRepo.AddAsync(profile);
        }
        else
        {
            profile.SetAvatar(url);
        }

        await _profileRepo.SaveChangesAsync();
        return Ok(new { url });
    }
}

public record UpdateProfileRequest(string FirstName, string LastName);
