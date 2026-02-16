using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using Xunit;

namespace KLL.Store.IntegrationTests.Controllers;

public class CategoriesControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly HttpClient _adminClient;

    public CategoriesControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
        _adminClient = factory.CreateClient();
        _adminClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "Admin");
    }

    [Fact]
    public async Task GetAll_ShouldReturnEmptyList()
    {
        var response = await _client.GetAsync("/api/v1/categories");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Create_WithAdmin_ShouldReturn201()
    {
        var category = new { Name = "Eletronicos", Description = "Produtos eletronicos" };

        var response = await _adminClient.PostAsJsonAsync("/api/v1/categories", category);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("name").GetString().Should().Be("Eletronicos");
        body.GetProperty("slug").GetString().Should().Be("eletronicos");
    }

    [Fact]
    public async Task Create_WithoutAuth_ShouldReturn401()
    {
        var category = new { Name = "Test", Description = "Test" };

        var response = await _client.PostAsJsonAsync("/api/v1/categories", category);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task CreateSubcategory_ShouldAppearInTree()
    {
        var parent = new { Name = "Parent Cat", Description = "Parent" };
        var parentResp = await _adminClient.PostAsJsonAsync("/api/v1/categories", parent);
        var parentBody = await parentResp.Content.ReadFromJsonAsync<JsonElement>();
        var parentId = parentBody.GetProperty("id").GetString();

        var child = new { Name = "Child Cat", Description = "Child", ParentCategoryId = parentId };
        var childResp = await _adminClient.PostAsJsonAsync("/api/v1/categories", child);

        childResp.StatusCode.Should().Be(HttpStatusCode.Created);

        var treeResp = await _client.GetAsync("/api/v1/categories/tree");
        treeResp.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetById_ExistingCategory_ShouldReturn200()
    {
        var category = new { Name = "GetById Cat", Description = "Test" };
        var createResp = await _adminClient.PostAsJsonAsync("/api/v1/categories", category);
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString();

        var response = await _client.GetAsync($"/api/v1/categories/{id}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        body.GetProperty("name").GetString().Should().Be("GetById Cat");
    }

    [Fact]
    public async Task GetById_NonExistent_ShouldReturn404()
    {
        var response = await _client.GetAsync($"/api/v1/categories/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Update_WithAdmin_ShouldReturn200()
    {
        var category = new { Name = "Original Cat", Description = "Desc" };
        var createResp = await _adminClient.PostAsJsonAsync("/api/v1/categories", category);
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString();

        var updated = new { Name = "Updated Cat", Description = "New Desc", DisplayOrder = 5 };
        var updateResp = await _adminClient.PutAsJsonAsync($"/api/v1/categories/{id}", updated);

        updateResp.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Delete_WithAdmin_ShouldReturn204()
    {
        var category = new { Name = "ToDelete Cat", Description = "Desc" };
        var createResp = await _adminClient.PostAsJsonAsync("/api/v1/categories", category);
        var created = await createResp.Content.ReadFromJsonAsync<JsonElement>();
        var id = created.GetProperty("id").GetString();

        var deleteResp = await _adminClient.DeleteAsync($"/api/v1/categories/{id}");

        deleteResp.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }
}
