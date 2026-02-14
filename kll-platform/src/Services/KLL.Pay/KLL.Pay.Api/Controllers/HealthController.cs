using Microsoft.AspNetCore.Mvc;

namespace KLL.Pay.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "Healthy", service = "KLL.Pay", timestamp = DateTime.UtcNow });
}