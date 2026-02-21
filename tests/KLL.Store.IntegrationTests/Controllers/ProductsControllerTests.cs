using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Xunit;

namespace KLL.Store.IntegrationTests.Controllers;

public class ProductsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly HttpClient _adminClient;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public ProductsControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _adminClient = factory.CreateClient();
        _adminClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "Admin");
    }

    [Fact]
    public async Task GetAll_ShouldReturn200WithArray()
    {
        var response = await _client.GetAsync("/api/v1/products");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().StartWith("[");
    }

    [Fact]
    public async Task Create_WithAdminAuth_ShouldReturn201()
    {
        var product = new
        {
            Name = "Test Product",
            Description = "Test Description",
            Price = 99.99m,
            StockQuantity = 10,
            Category = "Test"
        };

        var response = await _adminClient.PostAsJsonAsync("/api/v1/products", product);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("id").GetString().Should().NotBeNullOrEmpty();
        body.GetProperty("name").GetString().Should().Be("Test Product");
    }

    [Fact]
    public async Task Create_WithoutAuth_ShouldReturn401()
    {
        var product = new { Name = "Test", Description = "Desc", Price = 10m, StockQuantity = 1, Category = "Cat" };

        var response = await _client.PostAsJsonAsync("/api/v1/products", product);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateAndGetById_ShouldReturnProduct()
    {
        var product = new
        {
            Name = "GetById Product",
            Description = "Description",
            Price = 199.99m,
            StockQuantity = 25,
            Category = "Electronics"
        };

        var createResponse = await _adminClient.PostAsJsonAsync("/api/v1/products", product);
        var created = await createResponse.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString();

        var getResponse = await _client.GetAsync($"/api/v1/products/{id}");

        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await getResponse.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("name").GetString().Should().Be("GetById Product");
        body.GetProperty("price").GetDecimal().Should().Be(199.99m);
    }

    [Fact]
    public async Task GetById_NonExistent_ShouldReturn404()
    {
        var response = await _client.GetAsync($"/api/v1/products/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Update_WithAdmin_ShouldReturn200()
    {
        var product = new { Name = "Original", Description = "Desc", Price = 50m, StockQuantity = 5, Category = "Cat" };
        var createResponse = await _adminClient.PostAsJsonAsync("/api/v1/products", product);
        var created = await createResponse.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString();

        var updated = new { Name = "Updated", Description = "New Desc", Price = 75m, StockQuantity = 10, Category = "NewCat" };
        var updateResponse = await _adminClient.PutAsJsonAsync($"/api/v1/products/{id}", updated);

        updateResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await updateResponse.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("name").GetString().Should().Be("Updated");
    }

    [Fact]
    public async Task Delete_WithAdmin_ShouldReturn204()
    {
        var product = new { Name = "ToDelete", Description = "Desc", Price = 10m, StockQuantity = 1, Category = "Cat" };
        var createResponse = await _adminClient.PostAsJsonAsync("/api/v1/products", product);
        var created = await createResponse.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString();

        var deleteResponse = await _adminClient.DeleteAsync($"/api/v1/products/{id}");

        deleteResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task Search_ShouldReturnPaginatedResults()
    {
        var response = await _client.GetAsync("/api/v1/products/search?q=test&page=1&pageSize=10");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("totalCount").GetInt32().Should().BeGreaterThanOrEqualTo(0);
        body.GetProperty("page").GetInt32().Should().Be(1);
    }
}
