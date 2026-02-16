using KLL.BuildingBlocks.Infrastructure.Auth;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/cart")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly ICartRepository _cartRepo;
    private readonly IProductRepository _productRepo;

    public CartController(ICartRepository cartRepo, IProductRepository productRepo)
    {
        _cartRepo = cartRepo;
        _productRepo = productRepo;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var cart = await _cartRepo.GetByCustomerIdAsync(userId);
        if (cart is null) return Ok(new { Items = new List<object>(), Total = 0m, ItemCount = 0 });

        return Ok(new {
            cart.Id,
            Items = cart.Items.Select(i => new {
                i.ProductId, i.ProductName, i.UnitPrice, i.Quantity, Total = i.Total, i.ImageUrl
            }),
            cart.Total,
            cart.ItemCount
        });
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddToCartRequest req)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var product = await _productRepo.GetByIdAsync(req.ProductId);
        if (product is null) return NotFound("Produto nao encontrado");
        if (product.StockQuantity < req.Quantity) return BadRequest("Estoque insuficiente");

        var cart = await _cartRepo.GetByCustomerIdAsync(userId);
        if (cart is null)
        {
            cart = new Cart(userId);
            await _cartRepo.AddAsync(cart);
        }

        cart.AddItem(product.Id, product.Name, product.Price, req.Quantity, product.ImageUrl);
        await _cartRepo.SaveChangesAsync();

        return Ok(new { cart.Total, cart.ItemCount });
    }

    [HttpPut("items/{productId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid productId, [FromBody] UpdateCartItemRequest req)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var cart = await _cartRepo.GetByCustomerIdAsync(userId);
        if (cart is null) return NotFound();

        cart.UpdateItemQuantity(productId, req.Quantity);
        await _cartRepo.SaveChangesAsync();

        return Ok(new { cart.Total, cart.ItemCount });
    }

    [HttpDelete("items/{productId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid productId)
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var cart = await _cartRepo.GetByCustomerIdAsync(userId);
        if (cart is null) return NotFound();

        cart.RemoveItem(productId);
        await _cartRepo.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var userId = User.GetUserId();
        if (userId is null) return Unauthorized();

        var cart = await _cartRepo.GetByCustomerIdAsync(userId);
        if (cart is null) return NotFound();

        cart.Clear();
        await _cartRepo.SaveChangesAsync();
        return NoContent();
    }
}

public record AddToCartRequest(Guid ProductId, int Quantity = 1);
public record UpdateCartItemRequest(int Quantity);
