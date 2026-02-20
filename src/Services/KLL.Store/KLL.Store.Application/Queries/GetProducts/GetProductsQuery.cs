using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.Store.Application.DTOs.Responses;

namespace KLL.Store.Application.Queries.GetProducts;

public record GetProductsQuery(string? Category = null, string? Search = null) : IQuery<List<ProductResponse>>;
