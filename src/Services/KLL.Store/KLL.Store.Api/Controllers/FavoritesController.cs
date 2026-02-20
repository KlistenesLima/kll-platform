using KLL.BuildingBlocks.Infrastructure.Auth;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/favorites")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteRepository _repo;
    private readonly IProductRepository _productRepo;
    public FavoritesController(IFavoriteRepository repo, IProductRepository productRepo)
    {
        _repo = repo;
        _productRepo = productRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var favorites = await _repo.GetByCustomerIdAsync(userId);
        var productIds = favorites.Select(f => f.ProductId).ToList();
        var products = new List<object>();

        foreach (var fav in favorites)
        {
            var product = await _productRepo.GetByIdAsync(fav.ProductId);
            if (product is not null && product.IsActive)
            {
                products.Add(new
                {
                    product.Id,
                    product.Name,
                    product.Description,
                    product.Price,
                    product.StockQuantity,
                    Category = product.CategoryNav?.Name ?? product.Category,
                    product.CategoryId,
                    product.ImageUrl,
                    product.IsActive,
                    product.CreatedAt,
                    FavoritedAt = fav.CreatedAt
                });
            }
        }

        return Ok(products);
    }

    [HttpGet("ids")]
    public async Task<IActionResult> GetIds()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var ids = await _repo.GetProductIdsAsync(userId);
        return Ok(ids);
    }

    [HttpPost("{productId:guid}")]
    public async Task<IActionResult> Add(Guid productId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var exists = await _repo.ExistsAsync(userId, productId);
        if (exists) return Ok(new { message = "Ja esta nos favoritos" });

        var favorite = Favorite.Create(userId, productId);
        await _repo.AddAsync(favorite);
        await _repo.SaveChangesAsync();

        return Created($"/api/v1/favorites/{productId}", new { productId });
    }

    [HttpDelete("{productId:guid}")]
    public async Task<IActionResult> Remove(Guid productId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var favorite = await _repo.GetAsync(userId, productId);
        if (favorite is null) return NotFound();

        _repo.Delete(favorite);
        await _repo.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{productId:guid}/check")]
    public async Task<IActionResult> Check(Guid productId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var isFavorite = await _repo.ExistsAsync(userId, productId);
        return Ok(new { isFavorite });
    }
}
