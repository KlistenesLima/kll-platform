using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryRepository _repo;
    public CategoriesController(ICategoryRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool activeOnly = true)
    {
        var categories = await _repo.GetAllAsync(activeOnly);
        return Ok(categories.Select(c => new {
            c.Id, c.Name, c.Slug, c.Description, c.ImageUrl,
            c.ParentCategoryId, c.IsActive, c.DisplayOrder
        }));
    }

    [HttpGet("tree")]
    public async Task<IActionResult> GetTree()
    {
        var roots = await _repo.GetRootCategoriesAsync();
        return Ok(roots.Select(MapCategory));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var cat = await _repo.GetByIdAsync(id);
        return cat is null ? NotFound() : Ok(MapCategory(cat));
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var cat = await _repo.GetBySlugAsync(slug);
        return cat is null ? NotFound() : Ok(new { cat.Id, cat.Name, cat.Slug, cat.Description, cat.ImageUrl });
    }

    [HttpPost]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest req)
    {
        var cat = new Category(req.Name, req.Description, req.ImageUrl, req.ParentCategoryId);
        await _repo.AddAsync(cat);
        await _repo.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cat.Id }, new { cat.Id, cat.Name, cat.Slug });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest req)
    {
        var cat = await _repo.GetByIdAsync(id);
        if (cat is null) return NotFound();
        cat.Update(req.Name, req.Description, req.ImageUrl, req.DisplayOrder);
        _repo.Update(cat);
        await _repo.SaveChangesAsync();
        return Ok(new { cat.Id, cat.Name, cat.Slug });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var cat = await _repo.GetByIdAsync(id);
        if (cat is null) return NotFound();
        cat.Deactivate();
        await _repo.SaveChangesAsync();
        return NoContent();
    }

    private static object MapCategory(Category c) => new {
        c.Id, c.Name, c.Slug, c.Description, c.ImageUrl, c.IsActive, c.DisplayOrder,
        SubCategories = c.SubCategories?.Select(s => new { s.Id, s.Name, s.Slug, s.Description, s.ImageUrl })
    };
}

public record CreateCategoryRequest(string Name, string? Description, string? ImageUrl, Guid? ParentCategoryId);
public record UpdateCategoryRequest(string Name, string? Description, string? ImageUrl, int DisplayOrder);
