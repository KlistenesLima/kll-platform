using KLL.Logistics.Application.DTOs.Requests;
using KLL.Logistics.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Logistics.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ShipmentsController : ControllerBase
{
    private readonly ShipmentService _svc;
    public ShipmentsController(ShipmentService svc) => _svc = svc;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateShipmentRequest req, CancellationToken ct)
    {
        var s = await _svc.CreateAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = s.Id }, s);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var s = await _svc.GetByIdAsync(id, ct);
        return s is null ? NotFound() : Ok(s);
    }

    [HttpGet("track/{trackingCode}")]
    public async Task<IActionResult> Track(string trackingCode, CancellationToken ct)
    {
        var s = await _svc.GetByTrackingCodeAsync(trackingCode, ct);
        return s is null ? NotFound() : Ok(s);
    }

    [HttpPost("{id:guid}/assign-driver")]
    public async Task<IActionResult> AssignDriver(Guid id, [FromBody] AssignDriverRequest req, CancellationToken ct)
    { await _svc.AssignDriverAsync(id, req.DriverId, ct); return NoContent(); }

    [HttpPost("{id:guid}/deliver")]
    public async Task<IActionResult> MarkDelivered(Guid id, CancellationToken ct)
    { await _svc.MarkDeliveredAsync(id, ct); return NoContent(); }
}

public record AssignDriverRequest(Guid DriverId);
