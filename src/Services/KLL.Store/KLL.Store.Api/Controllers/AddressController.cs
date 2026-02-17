using KLL.BuildingBlocks.Infrastructure.Auth;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/addresses")]
[Authorize]
public class AddressController : ControllerBase
{
    private readonly IAddressRepository _repo;
    public AddressController(IAddressRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var addresses = await _repo.GetByCustomerIdAsync(userId);
        return Ok(addresses.Select(a => MapAddress(a)));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var address = await _repo.GetByIdAsync(id);
        if (address is null || address.CustomerId != userId) return NotFound();

        return Ok(MapAddress(address));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AddressRequest req)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var count = await _repo.CountByCustomerIdAsync(userId);
        if (count >= 5) return BadRequest("Limite de 5 enderecos atingido");

        var address = CustomerAddress.Create(userId, req.Label, req.Street, req.Number,
            req.Complement, req.Neighborhood, req.City, req.State, req.ZipCode);

        if (count == 0) address.SetAsDefault();

        await _repo.AddAsync(address);
        await _repo.SaveChangesAsync();

        return Created($"/api/v1/addresses/{address.Id}", MapAddress(address));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AddressRequest req)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var address = await _repo.GetByIdAsync(id);
        if (address is null || address.CustomerId != userId) return NotFound();

        address.Update(req.Label, req.Street, req.Number, req.Complement,
            req.Neighborhood, req.City, req.State, req.ZipCode);

        await _repo.SaveChangesAsync();
        return Ok(MapAddress(address));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var address = await _repo.GetByIdAsync(id);
        if (address is null || address.CustomerId != userId) return NotFound();

        _repo.Delete(address);
        await _repo.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:guid}/default")]
    public async Task<IActionResult> SetDefault(Guid id)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var address = await _repo.GetByIdAsync(id);
        if (address is null || address.CustomerId != userId) return NotFound();

        var all = await _repo.GetByCustomerIdAsync(userId);
        foreach (var a in all)
        {
            if (a.IsDefault) a.UnsetDefault();
        }

        address.SetAsDefault();
        await _repo.SaveChangesAsync();

        return Ok(MapAddress(address));
    }

    private static object MapAddress(CustomerAddress a) => new
    {
        a.Id, a.CustomerId, a.Label, a.Street, a.Number, a.Complement,
        a.Neighborhood, a.City, a.State, a.ZipCode, a.IsDefault, a.CreatedAt
    };
}

public record AddressRequest(
    string Label, string Street, string Number, string? Complement,
    string Neighborhood, string City, string State, string ZipCode);
