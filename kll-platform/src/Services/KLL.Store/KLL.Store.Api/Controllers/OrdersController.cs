using KLL.Store.Application.Commands;
using KLL.Store.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess ? Created($"/api/v1/orders/{result.Value}", new { id = result.Value }) : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrderByIdQuery(id), ct);
        return result != null ? Ok(result) : NotFound();
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(string customerId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrdersByCustomerQuery(customerId), ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/confirm-payment")]
    public async Task<IActionResult> ConfirmPayment(Guid id, [FromBody] ConfirmPaymentRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new ConfirmPaymentCommand(id, request.ChargeId), ct);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }
}

public record ConfirmPaymentRequest(string ChargeId);