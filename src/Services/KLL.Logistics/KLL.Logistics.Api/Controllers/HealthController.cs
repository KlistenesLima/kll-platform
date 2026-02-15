using Microsoft.AspNetCore.Mvc;

namespace KLL.Logistics.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "Healthy", service = "KLL.Logistics", timestamp = DateTime.UtcNow });
}
