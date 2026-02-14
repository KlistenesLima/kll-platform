using KLL.BuildingBlocks.Domain.Results;
using KLL.Store.Application.Commands;
using KLL.Store.Application.DTOs.Responses;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using MediatR;

namespace KLL.Store.Application.Handlers;

public class CreateProductHandler : IRequestHandler<CreateProductCommand, Result<ProductResponse>>
{
    private readonly IProductRepository _repo;

    public CreateProductHandler(IProductRepository repo) => _repo = repo;

    public async Task<Result<ProductResponse>> Handle(CreateProductCommand cmd, CancellationToken ct)
    {
        var product = Product.Create(cmd.Name, cmd.Description, cmd.Price, cmd.StockQuantity, cmd.Category);
        if (cmd.ImageUrl != null) product.Update(cmd.Name, cmd.Description, cmd.Price, cmd.Category, cmd.ImageUrl);

        await _repo.AddAsync(product, ct);
        await _repo.SaveChangesAsync(ct);

        return Result.Success(new ProductResponse(product.Id, product.Name, product.Description,
            product.Price.Amount, product.StockQuantity, product.Category, product.ImageUrl, product.IsActive, product.CreatedAt));
    }
}