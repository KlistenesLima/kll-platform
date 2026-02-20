using KLL.BuildingBlocks.Infrastructure.Auth;
using KLL.Store.Application.Commands.CreateOrder;
using KLL.Store.Application.Commands.ConfirmPayment;
using KLL.Store.Application.Commands.UpdateOrderStatus;
using KLL.Store.Application.Commands.CancelOrder;
using KLL.Store.Application.Queries.GetAllOrders;
using KLL.Store.Application.Queries.GetOrderById;
using KLL.Store.Application.Queries.GetOrdersByCustomer;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrdersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllOrdersQuery(), ct);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return result.IsSuccess
            ? Created($"/api/v1/orders/{result.Value}", new { id = result.Value })
            : BadRequest(result.Error);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrderByIdQuery(id), ct);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine(CancellationToken ct)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();
        var result = await _mediator.Send(new GetOrdersByCustomerQuery(userId), ct);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(string customerId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetOrdersByCustomerQuery(customerId), ct);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/confirm-payment")]
    public async Task<IActionResult> ConfirmPayment(Guid id, [FromBody] ConfirmPaymentRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new ConfirmPaymentCommand(id, request.ChargeId), ct);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequest request, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateOrderStatusCommand(id, request.Status), ct);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelOrderRequest? request, CancellationToken ct)
    {
        var result = await _mediator.Send(new CancelOrderCommand(id, request?.Reason), ct);
        return result.IsSuccess ? Ok() : BadRequest(result.Error);
    }
}

public record ConfirmPaymentRequest(string ChargeId);
public record UpdateStatusRequest(string Status);
public record CancelOrderRequest(string? Reason);
