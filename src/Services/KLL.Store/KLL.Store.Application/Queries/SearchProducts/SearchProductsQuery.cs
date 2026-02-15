using KLL.BuildingBlocks.CQRS.Abstractions;
using KLL.Store.Application.DTOs.Responses;

namespace KLL.Store.Application.Queries.SearchProducts;

public record SearchProductsQuery(string Term) : IQuery<List<ProductResponse>>;
