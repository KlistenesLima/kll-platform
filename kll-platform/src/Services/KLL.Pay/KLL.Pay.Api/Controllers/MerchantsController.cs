using KLL.Pay.Application.DTOs.Requests;
using KLL.Pay.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Pay.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class MerchantsController : ControllerBase
{
    private readonly MerchantService _svc;
    public MerchantsController(MerchantService svc) => _svc = svc;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMerchantRequest req, CancellationToken ct)
    {
        var merchant = await _svc.CreateAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = merchant.Id }, merchant);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var m = await _svc.GetByIdAsync(id, ct);
        return m is null ? NotFound() : Ok(m);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) => Ok(await _svc.GetAllAsync(ct));
}