using KLL.Store.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/shipping")]
public class ShippingController : ControllerBase
{
    private readonly ShippingService _shippingService;

    public ShippingController(ShippingService shippingService)
    {
        _shippingService = shippingService;
    }

    [HttpGet("calculate")]
    public IActionResult Calculate([FromQuery] string cep, [FromQuery] decimal cartTotal = 0)
    {
        var result = _shippingService.Calculate(cep, cartTotal);
        if (!result.Valid)
            return BadRequest(new { error = result.Error });

        return Ok(new
        {
            options = result.Options.Select(o => new
            {
                name = o.Name,
                price = o.Price,
                deliveryDays = o.MinDays == 0 && o.MaxDays == 0
                    ? "Hoje"
                    : $"{o.MinDays}-{o.MaxDays} dias uteis",
                minDays = o.MinDays,
                maxDays = o.MaxDays
            })
        });
    }
}
