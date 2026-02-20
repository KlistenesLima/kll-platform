using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.BuildingBlocks.Domain.Results;
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace KLL.Store.Application.Commands.CreateProduct;

public class CreateProductHandler : ICommandHandler<CreateProductCommand, Guid>
{
    private readonly IProductRepository _repository;
    private readonly ILogger<CreateProductHandler> _logger;

    public CreateProductHandler(IProductRepository repository, ILogger<CreateProductHandler> logger)
    { _repository = repository; _logger = logger; }

    public async Task<Result<Guid>> Handle(CreateProductCommand cmd, CancellationToken ct)
    {
        var product = new Product(cmd.Name, cmd.Description, cmd.Price, cmd.StockQuantity, cmd.Category, null, cmd.ImageUrl);
        await _repository.AddAsync(product, ct);
        await _repository.SaveChangesAsync(ct);

        _logger.LogInformation("Product created: {ProductId} - {Name}", product.Id, product.Name);
        return Result.Success(product.Id);
    }
}
