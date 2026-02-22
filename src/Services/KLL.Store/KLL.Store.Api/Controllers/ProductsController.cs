using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _repo;
    private readonly StoreDbContext _db;

    public ProductsController(IProductRepository repo, StoreDbContext db)
    {
        _repo = repo;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _repo.GetAllAsync();
        return Ok(products.Select(p => new {
            p.Id, p.Name, p.Description, p.Price, p.StockQuantity, p.Category, p.CategoryId, p.ImageUrl, p.IsActive, p.CreatedAt
        }));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) return NotFound();
        return Ok(new { p.Id, p.Name, p.Description, p.Price, p.StockQuantity, p.Category, p.CategoryId, p.ImageUrl, p.IsActive, p.CreatedAt });
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string? q, [FromQuery] Guid? categoryId,
        [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice,
        [FromQuery] string? sortBy, [FromQuery] bool sortDesc = false,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _db.Products.Where(p => p.IsActive).AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(p => p.Name.Contains(q) || p.Description.Contains(q));
        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);
        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);
        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        var totalCount = await query.CountAsync();

        query = sortBy?.ToLower() switch
        {
            "price" => sortDesc ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
            "name" => sortDesc ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new { p.Id, p.Name, p.Description, p.Price, p.StockQuantity, p.Category, p.CategoryId, p.ImageUrl, p.CreatedAt })
            .ToListAsync();

        return Ok(new {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpGet("category/{categoryId:guid}")]
    public async Task<IActionResult> GetByCategory(Guid categoryId)
    {
        var products = await _db.Products.Where(p => p.CategoryId == categoryId && p.IsActive)
            .OrderBy(p => p.Name).ToListAsync();
        return Ok(products.Select(p => new { p.Id, p.Name, p.Description, p.Price, p.StockQuantity, p.ImageUrl }));
    }

    [HttpPost]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Create([FromBody] CreateProductReq req)
    {
        var product = new KLL.Store.Domain.Entities.Product(req.Name, req.Description, req.Price, req.StockQuantity, req.Category, req.CategoryId, req.ImageUrl);
        await _repo.AddAsync(product);
        await _repo.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, new { product.Id, product.Name });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateProductReq req)
    {
        var product = await _repo.GetByIdAsync(id);
        if (product is null) return NotFound();
        product.Update(req.Name, req.Description, req.Price, req.StockQuantity, req.Category, req.CategoryId, req.ImageUrl);
        await _repo.SaveChangesAsync();
        return Ok(new { product.Id, product.Name });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var product = await _repo.GetByIdAsync(id);
        if (product is null) return NotFound();
        product.Deactivate();
        await _repo.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateProductReq(string Name, string Description, decimal Price, int StockQuantity, string Category, Guid? CategoryId = null, string? ImageUrl = null);
