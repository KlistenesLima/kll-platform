# ============================================================
# KLL PLATFORM UPGRADE - Fase 1-4 Completo
# Auth + Categories + Cart + Storefront + Admin Auth
# Execute na raiz: C:\Users\User\Desktop\Sistemas 2026\kll-platform
# ============================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KLL Platform - Full Upgrade Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ============================================================
# FASE 1: KEYCLOAK REALM
# ============================================================
Write-Host "`n[1/12] Keycloak Realm..." -ForegroundColor Yellow

$realmJson = @'
{
  "realm": "kll-platform",
  "enabled": true,
  "sslRequired": "none",
  "registrationAllowed": true,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true,
  "roles": {
    "realm": [
      { "name": "admin", "description": "Platform administrator" },
      { "name": "customer", "description": "Platform customer" }
    ]
  },
  "defaultRoles": ["customer"],
  "clients": [
    {
      "clientId": "kll-storefront",
      "name": "KLL Storefront",
      "enabled": true,
      "publicClient": true,
      "directAccessGrantsEnabled": true,
      "redirectUris": ["http://localhost:5174/*", "http://localhost:5173/*"],
      "webOrigins": ["http://localhost:5174", "http://localhost:5173"],
      "protocol": "openid-connect",
      "standardFlowEnabled": true,
      "implicitFlowEnabled": false,
      "attributes": { "pkce.code.challenge.method": "S256" },
      "protocolMappers": [
        {
          "name": "realm-roles",
          "protocol": "openid-connect",
          "protocolMapper": "oidc-usermodel-realm-role-mapper",
          "config": {
            "claim.name": "realm_roles",
            "jsonType.label": "String",
            "multivalued": "true",
            "id.token.claim": "true",
            "access.token.claim": "true",
            "userinfo.token.claim": "true"
          }
        }
      ]
    },
    {
      "clientId": "kll-admin",
      "name": "KLL Admin Panel",
      "enabled": true,
      "publicClient": true,
      "directAccessGrantsEnabled": true,
      "redirectUris": ["http://localhost:5173/*"],
      "webOrigins": ["http://localhost:5173"],
      "protocol": "openid-connect",
      "standardFlowEnabled": true,
      "protocolMappers": [
        {
          "name": "realm-roles",
          "protocol": "openid-connect",
          "protocolMapper": "oidc-usermodel-realm-role-mapper",
          "config": {
            "claim.name": "realm_roles",
            "jsonType.label": "String",
            "multivalued": "true",
            "id.token.claim": "true",
            "access.token.claim": "true",
            "userinfo.token.claim": "true"
          }
        }
      ]
    },
    {
      "clientId": "kll-api",
      "name": "KLL API",
      "enabled": true,
      "bearerOnly": true,
      "protocol": "openid-connect"
    }
  ],
  "users": [
    {
      "username": "admin",
      "email": "admin@kll.com",
      "enabled": true,
      "firstName": "Admin",
      "lastName": "KLL",
      "credentials": [{ "type": "password", "value": "Admin123!", "temporary": false }],
      "realmRoles": ["admin", "customer"]
    },
    {
      "username": "cliente",
      "email": "cliente@email.com",
      "enabled": true,
      "firstName": "Cliente",
      "lastName": "Teste",
      "credentials": [{ "type": "password", "value": "Cliente123!", "temporary": false }],
      "realmRoles": ["customer"]
    }
  ]
}
'@
Set-Content -Path "infra\keycloak\kll-platform-realm.json" -Value $realmJson -Encoding UTF8
Write-Host "  OK: infra\keycloak\kll-platform-realm.json" -ForegroundColor Green

# ============================================================
# FASE 2: AUTH EXTENSIONS (BuildingBlocks)
# ============================================================
Write-Host "`n[2/12] Auth Extensions..." -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path "src\BuildingBlocks\KLL.BuildingBlocks.Infrastructure\Auth" | Out-Null

$authExtensions = @'
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace KLL.BuildingBlocks.Infrastructure.Auth;

public static class AuthExtensions
{
    public static IServiceCollection AddKllAuth(this IServiceCollection services, IConfiguration config)
    {
        var authority = config["Keycloak:Authority"] ?? "http://localhost:8081/realms/kll-platform";

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opt =>
            {
                opt.Authority = authority;
                opt.Audience = "kll-api";
                opt.RequireHttpsMetadata = false;
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = authority,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    RoleClaimType = "realm_roles",
                    NameClaimType = "preferred_username"
                };
            });

        services.AddAuthorization(opt =>
        {
            opt.AddPolicy("AdminOnly", p => p.RequireRole("admin"));
            opt.AddPolicy("CustomerOnly", p => p.RequireRole("customer"));
        });

        return services;
    }

    public static string? GetUserId(this ClaimsPrincipal user)
        => user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst("sub")?.Value;

    public static string? GetUserName(this ClaimsPrincipal user)
        => user.FindFirst("preferred_username")?.Value ?? user.FindFirst(ClaimTypes.Name)?.Value;

    public static string? GetUserEmail(this ClaimsPrincipal user)
        => user.FindFirst(ClaimTypes.Email)?.Value ?? user.FindFirst("email")?.Value;

    public static bool IsAdmin(this ClaimsPrincipal user)
        => user.IsInRole("admin");
}
'@
Set-Content -Path "src\BuildingBlocks\KLL.BuildingBlocks.Infrastructure\Auth\AuthExtensions.cs" -Value $authExtensions -Encoding UTF8
Write-Host "  OK: AuthExtensions.cs" -ForegroundColor Green

# Add JwtBearer package reference
$infraCsproj = Get-Content "src\BuildingBlocks\KLL.BuildingBlocks.Infrastructure\KLL.BuildingBlocks.Infrastructure.csproj" -Raw
if ($infraCsproj -notmatch "JwtBearer") {
    $infraCsproj = $infraCsproj -replace '</Project>', '  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.11" />
  </ItemGroup>
</Project>'
    Set-Content -Path "src\BuildingBlocks\KLL.BuildingBlocks.Infrastructure\KLL.BuildingBlocks.Infrastructure.csproj" -Value $infraCsproj -Encoding UTF8
    Write-Host "  OK: Added JwtBearer package to Infrastructure" -ForegroundColor Green
}

# ============================================================
# FASE 3: CATEGORY ENTITY
# ============================================================
Write-Host "`n[3/12] Category Entity..." -ForegroundColor Yellow

$categoryEntity = @'
using KLL.BuildingBlocks.Domain.Entities;

namespace KLL.Store.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? ImageUrl { get; private set; }
    public Guid? ParentCategoryId { get; private set; }
    public Category? ParentCategory { get; private set; }
    public ICollection<Category> SubCategories { get; private set; } = new List<Category>();
    public ICollection<Product> Products { get; private set; } = new List<Product>();
    public bool IsActive { get; private set; } = true;
    public int DisplayOrder { get; private set; }

    protected Category() { }

    public Category(string name, string? description = null, string? imageUrl = null, Guid? parentCategoryId = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        Slug = GenerateSlug(name);
        Description = description;
        ImageUrl = imageUrl;
        ParentCategoryId = parentCategoryId;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(string name, string? description, string? imageUrl, int displayOrder)
    {
        Name = name;
        Slug = GenerateSlug(name);
        Description = description;
        ImageUrl = imageUrl;
        DisplayOrder = displayOrder;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;

    private static string GenerateSlug(string name)
        => name.ToLowerInvariant()
            .Replace(" ", "-").Replace("ã", "a").Replace("á", "a").Replace("â", "a")
            .Replace("é", "e").Replace("ê", "e").Replace("í", "i")
            .Replace("ó", "o").Replace("ô", "o").Replace("ú", "u").Replace("ç", "c");
}
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Domain\Entities\Category.cs" -Value $categoryEntity -Encoding UTF8
Write-Host "  OK: Category.cs" -ForegroundColor Green

# ============================================================
# FASE 4: CART & CARTITEM ENTITIES
# ============================================================
Write-Host "`n[4/12] Cart Entities..." -ForegroundColor Yellow

$cartEntity = @'
using KLL.BuildingBlocks.Domain.Entities;

namespace KLL.Store.Domain.Entities;

public class Cart : BaseEntity
{
    public string CustomerId { get; private set; } = string.Empty;
    public ICollection<CartItem> Items { get; private set; } = new List<CartItem>();
    public DateTime UpdatedAt { get; private set; }

    protected Cart() { }

    public Cart(string customerId)
    {
        Id = Guid.NewGuid();
        CustomerId = customerId;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddItem(Guid productId, string productName, decimal unitPrice, int quantity, string? imageUrl = null)
    {
        var existing = Items.FirstOrDefault(i => i.ProductId == productId);
        if (existing is not null)
            existing.UpdateQuantity(existing.Quantity + quantity);
        else
            Items.Add(new CartItem(Id, productId, productName, unitPrice, quantity, imageUrl));
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateItemQuantity(Guid productId, int quantity)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item is null) return;
        if (quantity <= 0) Items.Remove(item);
        else item.UpdateQuantity(quantity);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveItem(Guid productId)
    {
        var item = Items.FirstOrDefault(i => i.ProductId == productId);
        if (item is not null) { Items.Remove(item); UpdatedAt = DateTime.UtcNow; }
    }

    public void Clear() { Items.Clear(); UpdatedAt = DateTime.UtcNow; }
    public decimal Total => Items.Sum(i => i.Total);
    public int ItemCount => Items.Sum(i => i.Quantity);
}

public class CartItem : BaseEntity
{
    public Guid CartId { get; private set; }
    public Guid ProductId { get; private set; }
    public string ProductName { get; private set; } = string.Empty;
    public decimal UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public string? ImageUrl { get; private set; }

    protected CartItem() { }

    public CartItem(Guid cartId, Guid productId, string productName, decimal unitPrice, int quantity, string? imageUrl)
    {
        Id = Guid.NewGuid();
        CartId = cartId;
        ProductId = productId;
        ProductName = productName;
        UnitPrice = unitPrice;
        Quantity = quantity;
        ImageUrl = imageUrl;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateQuantity(int quantity) => Quantity = quantity;
    public decimal Total => UnitPrice * Quantity;
}
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Domain\Entities\Cart.cs" -Value $cartEntity -Encoding UTF8
Write-Host "  OK: Cart.cs + CartItem.cs" -ForegroundColor Green

# ============================================================
# FASE 5: UPDATE PRODUCT ENTITY (add CategoryId, ImageUrl, IsActive)
# ============================================================
Write-Host "`n[5/12] Update Product Entity..." -ForegroundColor Yellow

$productEntity = @'
using KLL.BuildingBlocks.Domain.Entities;

namespace KLL.Store.Domain.Entities;

public class Product : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public decimal Price { get; private set; }
    public int StockQuantity { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public Guid? CategoryId { get; private set; }
    public Category? CategoryNav { get; private set; }
    public string? ImageUrl { get; private set; }
    public bool IsActive { get; private set; } = true;

    protected Product() { }

    public Product(string name, string description, decimal price, int stockQuantity, string category, Guid? categoryId = null, string? imageUrl = null)
    {
        Id = Guid.NewGuid();
        Name = name;
        Description = description;
        Price = price;
        StockQuantity = stockQuantity;
        Category = category;
        CategoryId = categoryId;
        ImageUrl = imageUrl;
        CreatedAt = DateTime.UtcNow;
    }

    public void Update(string name, string description, decimal price, int stockQuantity, string category, Guid? categoryId = null, string? imageUrl = null)
    {
        Name = name;
        Description = description;
        Price = price;
        StockQuantity = stockQuantity;
        Category = category;
        CategoryId = categoryId;
        ImageUrl = imageUrl;
    }

    public bool DeductStock(int quantity)
    {
        if (StockQuantity < quantity) return false;
        StockQuantity -= quantity;
        return true;
    }

    public void RestoreStock(int quantity) => StockQuantity += quantity;
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Domain\Entities\Product.cs" -Value $productEntity -Encoding UTF8
Write-Host "  OK: Product.cs updated" -ForegroundColor Green

# ============================================================
# FASE 6: REPOSITORY INTERFACES
# ============================================================
Write-Host "`n[6/12] Repository Interfaces..." -ForegroundColor Yellow

$categoryRepo = @'
using KLL.Store.Domain.Entities;

namespace KLL.Store.Domain.Interfaces;

public interface ICategoryRepository
{
    Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<List<Category>> GetAllAsync(bool activeOnly = true, CancellationToken ct = default);
    Task<List<Category>> GetRootCategoriesAsync(CancellationToken ct = default);
    Task AddAsync(Category category, CancellationToken ct = default);
    void Update(Category category);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Domain\Interfaces\ICategoryRepository.cs" -Value $categoryRepo -Encoding UTF8

$cartRepo = @'
using KLL.Store.Domain.Entities;

namespace KLL.Store.Domain.Interfaces;

public interface ICartRepository
{
    Task<Cart?> GetByCustomerIdAsync(string customerId, CancellationToken ct = default);
    Task AddAsync(Cart cart, CancellationToken ct = default);
    void Update(Cart cart);
    void Delete(Cart cart);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Domain\Interfaces\ICartRepository.cs" -Value $cartRepo -Encoding UTF8
Write-Host "  OK: ICategoryRepository.cs + ICartRepository.cs" -ForegroundColor Green

# ============================================================
# FASE 7: REPOSITORY IMPLEMENTATIONS
# ============================================================
Write-Host "`n[7/12] Repository Implementations..." -ForegroundColor Yellow

$categoryRepoImpl = @'
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly StoreDbContext _db;
    public CategoryRepository(StoreDbContext db) => _db = db;

    public async Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _db.Categories.Include(c => c.SubCategories).FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<Category?> GetBySlugAsync(string slug, CancellationToken ct = default)
        => await _db.Categories.FirstOrDefaultAsync(c => c.Slug == slug, ct);

    public async Task<List<Category>> GetAllAsync(bool activeOnly = true, CancellationToken ct = default)
        => await _db.Categories.Where(c => !activeOnly || c.IsActive).OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name).ToListAsync(ct);

    public async Task<List<Category>> GetRootCategoriesAsync(CancellationToken ct = default)
        => await _db.Categories.Where(c => c.ParentCategoryId == null && c.IsActive)
            .Include(c => c.SubCategories.Where(s => s.IsActive))
            .OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name).ToListAsync(ct);

    public async Task AddAsync(Category category, CancellationToken ct = default)
        => await _db.Categories.AddAsync(category, ct);

    public void Update(Category category) => _db.Categories.Update(category);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _db.SaveChangesAsync(ct);
}
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Infra.Data\Repositories\CategoryRepository.cs" -Value $categoryRepoImpl -Encoding UTF8

$cartRepoImpl = @'
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Repositories;

public class CartRepository : ICartRepository
{
    private readonly StoreDbContext _db;
    public CartRepository(StoreDbContext db) => _db = db;

    public async Task<Cart?> GetByCustomerIdAsync(string customerId, CancellationToken ct = default)
        => await _db.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.CustomerId == customerId, ct);

    public async Task AddAsync(Cart cart, CancellationToken ct = default)
        => await _db.Carts.AddAsync(cart, ct);

    public void Update(Cart cart) => _db.Carts.Update(cart);
    public void Delete(Cart cart) => _db.Carts.Remove(cart);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _db.SaveChangesAsync(ct);
}
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Infra.Data\Repositories\CartRepository.cs" -Value $cartRepoImpl -Encoding UTF8
Write-Host "  OK: CategoryRepository.cs + CartRepository.cs" -ForegroundColor Green

# ============================================================
# FASE 8: UPDATE DbContext
# ============================================================
Write-Host "`n[8/12] Update StoreDbContext..." -ForegroundColor Yellow

$storeDbContext = @'
using KLL.Store.Domain.Entities;
using KLL.BuildingBlocks.Domain.Outbox;
using KLL.BuildingBlocks.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Infra.Data.Context;

public class StoreDbContext : DbContext
{
    public StoreDbContext(DbContextOptions<StoreDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.Name).HasMaxLength(200).IsRequired();
            b.Property(p => p.Description).HasMaxLength(2000);
            b.Property(p => p.Price).HasColumnType("decimal(18,2)");
            b.Property(p => p.Category).HasMaxLength(100);
            b.Property(p => p.ImageUrl).HasMaxLength(500);
            b.HasOne(p => p.CategoryNav).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.SetNull);
            b.HasIndex(p => p.CategoryId);
            b.HasIndex(p => p.IsActive);
        });

        modelBuilder.Entity<Order>(b =>
        {
            b.HasKey(o => o.Id);
            b.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
            b.Property(o => o.CustomerId).HasMaxLength(200);
            b.Property(o => o.CustomerEmail).HasMaxLength(200);
            b.HasMany(o => o.Items).WithOne().HasForeignKey(i => i.OrderId);
            b.HasIndex(o => o.CustomerId);
        });

        modelBuilder.Entity<OrderItem>(b =>
        {
            b.HasKey(i => i.Id);
            b.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Category>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.Name).HasMaxLength(200).IsRequired();
            b.Property(c => c.Slug).HasMaxLength(200).IsRequired();
            b.Property(c => c.Description).HasMaxLength(1000);
            b.Property(c => c.ImageUrl).HasMaxLength(500);
            b.HasOne(c => c.ParentCategory).WithMany(c => c.SubCategories).HasForeignKey(c => c.ParentCategoryId).OnDelete(DeleteBehavior.Restrict);
            b.HasIndex(c => c.Slug).IsUnique();
        });

        modelBuilder.Entity<Cart>(b =>
        {
            b.HasKey(c => c.Id);
            b.Property(c => c.CustomerId).HasMaxLength(200).IsRequired();
            b.HasMany(c => c.Items).WithOne().HasForeignKey(i => i.CartId).OnDelete(DeleteBehavior.Cascade);
            b.HasIndex(c => c.CustomerId).IsUnique();
        });

        modelBuilder.Entity<CartItem>(b =>
        {
            b.HasKey(i => i.Id);
            b.Property(i => i.ProductName).HasMaxLength(200);
            b.Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
            b.Property(i => i.ImageUrl).HasMaxLength(500);
        });

        modelBuilder.ApplyOutboxConfiguration();
    }
}
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Infra.Data\Context\StoreDbContext.cs" -Value $storeDbContext -Encoding UTF8
Write-Host "  OK: StoreDbContext.cs updated" -ForegroundColor Green

# ============================================================
# FASE 9: CONTROLLERS (Categories, Cart, Checkout, Search)
# ============================================================
Write-Host "`n[9/12] New Controllers..." -ForegroundColor Yellow

$categoriesController = @'
using KLL.Store.Domain.Entities;
using KLL.Store.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryRepository _repo;
    public CategoriesController(ICategoryRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool activeOnly = true)
    {
        var categories = await _repo.GetAllAsync(activeOnly);
        return Ok(categories.Select(c => new {
            c.Id, c.Name, c.Slug, c.Description, c.ImageUrl,
            c.ParentCategoryId, c.IsActive, c.DisplayOrder
        }));
    }

    [HttpGet("tree")]
    public async Task<IActionResult> GetTree()
    {
        var roots = await _repo.GetRootCategoriesAsync();
        return Ok(roots.Select(MapCategory));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var cat = await _repo.GetByIdAsync(id);
        return cat is null ? NotFound() : Ok(MapCategory(cat));
    }

    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var cat = await _repo.GetBySlugAsync(slug);
        return cat is null ? NotFound() : Ok(new { cat.Id, cat.Name, cat.Slug, cat.Description, cat.ImageUrl });
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest req)
    {
        var cat = new Category(req.Name, req.Description, req.ImageUrl, req.ParentCategoryId);
        await _repo.AddAsync(cat);
        await _repo.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cat.Id }, new { cat.Id, cat.Name, cat.Slug });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest req)
    {
        var cat = await _repo.GetByIdAsync(id);
        if (cat is null) return NotFound();
        cat.Update(req.Name, req.Description, req.ImageUrl, req.DisplayOrder);
        _repo.Update(cat);
        await _repo.SaveChangesAsync();
        return Ok(new { cat.Id, cat.Name, cat.Slug });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var cat = await _repo.GetByIdAsync(id);
        if (cat is null) return NotFound();
        cat.Deactivate();
        await _repo.SaveChangesAsync();
        return NoContent();
    }

    private static object MapCategory(Category c) => new {
        c.Id, c.Name, c.Slug, c.Description, c.ImageUrl, c.IsActive, c.DisplayOrder,
        SubCategories = c.SubCategories?.Select(s => new { s.Id, s.Name, s.Slug, s.Description, s.ImageUrl })
    };
}

public record CreateCategoryRequest(string Name, string? Description, string? ImageUrl, Guid? ParentCategoryId);
public record UpdateCategoryRequest(string Name, string? Description, string? ImageUrl, int DisplayOrder);
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Api\Controllers\CategoriesController.cs" -Value $categoriesController -Encoding UTF8

$cartController = @'
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
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Api\Controllers\CartController.cs" -Value $cartController -Encoding UTF8

# Search endpoint in ProductsController update
$searchController = @'
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/products")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _repo;
    private readonly StoreDbContext _db;

    public ProductsController(IProductRepository repo, StoreDbContext db)
    {
        _repo = repo;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var products = await _repo.GetAllAsync();
        return Ok(products.Select(p => new {
            p.Id, p.Name, p.Description, p.Price, p.StockQuantity, p.Category, p.CategoryId, p.ImageUrl, p.IsActive, p.CreatedAt
        }));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var p = await _repo.GetByIdAsync(id);
        if (p is null) return NotFound();
        return Ok(new { p.Id, p.Name, p.Description, p.Price, p.StockQuantity, p.Category, p.CategoryId, p.ImageUrl, p.IsActive, p.CreatedAt });
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search(
        [FromQuery] string? q, [FromQuery] Guid? categoryId,
        [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice,
        [FromQuery] string? sortBy, [FromQuery] bool sortDesc = false,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _db.Products.Where(p => p.IsActive).AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(p => p.Name.Contains(q) || p.Description.Contains(q));
        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);
        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);
        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        var totalCount = await query.CountAsync();

        query = sortBy?.ToLower() switch
        {
            "price" => sortDesc ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
            "name" => sortDesc ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new { p.Id, p.Name, p.Description, p.Price, p.StockQuantity, p.Category, p.CategoryId, p.ImageUrl, p.CreatedAt })
            .ToListAsync();

        return Ok(new {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        });
    }

    [HttpGet("category/{categoryId:guid}")]
    public async Task<IActionResult> GetByCategory(Guid categoryId)
    {
        var products = await _db.Products.Where(p => p.CategoryId == categoryId && p.IsActive)
            .OrderBy(p => p.Name).ToListAsync();
        return Ok(products.Select(p => new { p.Id, p.Name, p.Description, p.Price, p.StockQuantity, p.ImageUrl }));
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateProductReq req)
    {
        var product = new KLL.Store.Domain.Entities.Product(req.Name, req.Description, req.Price, req.StockQuantity, req.Category, req.CategoryId, req.ImageUrl);
        await _repo.AddAsync(product);
        await _repo.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, new { product.Id, product.Name });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CreateProductReq req)
    {
        var product = await _repo.GetByIdAsync(id);
        if (product is null) return NotFound();
        product.Update(req.Name, req.Description, req.Price, req.StockQuantity, req.Category, req.CategoryId, req.ImageUrl);
        await _repo.SaveChangesAsync();
        return Ok(new { product.Id, product.Name });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var product = await _repo.GetByIdAsync(id);
        if (product is null) return NotFound();
        product.Deactivate();
        await _repo.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateProductReq(string Name, string Description, decimal Price, int StockQuantity, string Category, Guid? CategoryId = null, string? ImageUrl = null);
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Api\Controllers\ProductsController.cs" -Value $searchController -Encoding UTF8

Write-Host "  OK: CategoriesController + CartController + ProductsController (search)" -ForegroundColor Green

# ============================================================
# FASE 10: UPDATE STORE API Program.cs
# ============================================================
Write-Host "`n[10/12] Update Store API Program.cs..." -ForegroundColor Yellow

$storeProgram = @'
using KLL.BuildingBlocks.Infrastructure.Auth;
using KLL.BuildingBlocks.Infrastructure.Extensions;
using KLL.BuildingBlocks.Infrastructure.Middleware;
using KLL.Store.Api.Consumers;
using KLL.Store.Domain.Interfaces;
using KLL.Store.Infra.Data.Context;
using KLL.Store.Infra.Data.Repositories;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();
builder.Host.UseSerilog();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Auth
builder.Services.AddKllAuth(builder.Configuration);

// Database
builder.Services.AddDbContext<StoreDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repositories
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();

// Infrastructure
builder.Services.AddKllInfrastructure(builder.Configuration);

// Kafka consumers
builder.Services.AddHostedService<PaymentConfirmedConsumer>();
builder.Services.AddHostedService<ShipmentCreatedConsumer>();

// CORS
builder.Services.AddCors(opt => opt.AddPolicy("AllowAll", p =>
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var app = builder.Build();

// Auto migrate
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
    await db.Database.MigrateAsync();
}

app.UseCors("AllowAll");
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<CorrelationIdMiddleware>();

if (app.Environment.IsDevelopment() || app.Environment.EnvironmentName == "Docker")
    { app.UseSwagger(); app.UseSwaggerUI(); }

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { Status = "Healthy", Service = "KLL.Store", Timestamp = DateTime.UtcNow }));

Log.Information("[KLL.Store] Started on port {Port}", builder.Configuration["ASPNETCORE_URLS"] ?? "5200");
app.Run();
'@
Set-Content -Path "src\Services\KLL.Store\KLL.Store.Api\Program.cs" -Value $storeProgram -Encoding UTF8
Write-Host "  OK: Store Program.cs updated with auth + cart + categories" -ForegroundColor Green

# ============================================================
# FASE 11: STOREFRONT REACT (kll-storefront)
# ============================================================
Write-Host "`n[11/12] Storefront React App..." -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path "src\Web\kll-storefront\src\components" | Out-Null
New-Item -ItemType Directory -Force -Path "src\Web\kll-storefront\src\pages" | Out-Null
New-Item -ItemType Directory -Force -Path "src\Web\kll-storefront\src\services" | Out-Null
New-Item -ItemType Directory -Force -Path "src\Web\kll-storefront\src\store" | Out-Null
New-Item -ItemType Directory -Force -Path "src\Web\kll-storefront\src\types" | Out-Null
New-Item -ItemType Directory -Force -Path "src\Web\kll-storefront\public" | Out-Null

# package.json
$storefrontPkg = @'
{
  "name": "kll-storefront",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5174",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "axios": "^1.7.2",
    "zustand": "^4.5.0",
    "keycloak-js": "^23.0.7",
    "react-icons": "^5.0.0",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.0",
    "vite": "^5.3.0"
  }
}
'@
Set-Content -Path "src\Web\kll-storefront\package.json" -Value $storefrontPkg -Encoding UTF8

# vite.config.ts
$viteConfig = @'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5174, proxy: { "/api": "http://localhost:5100" } },
});
'@
Set-Content -Path "src\Web\kll-storefront\vite.config.ts" -Value $viteConfig -Encoding UTF8

# tsconfig
$tsconfig = @'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
'@
Set-Content -Path "src\Web\kll-storefront\tsconfig.json" -Value $tsconfig -Encoding UTF8

# tailwind
$tailwindConfig = @'
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        kll: { 50: "#eff6ff", 100: "#dbeafe", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a5f" },
        accent: { 400: "#facc15", 500: "#eab308" },
      },
    },
  },
  plugins: [],
};
'@
Set-Content -Path "src\Web\kll-storefront\tailwind.config.js" -Value $tailwindConfig -Encoding UTF8

# postcss
Set-Content -Path "src\Web\kll-storefront\postcss.config.js" -Value 'export default { plugins: { tailwindcss: {}, autoprefixer: {} } };' -Encoding UTF8

# index.html
$indexHtml = @'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KLL Store - Marketplace</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
'@
Set-Content -Path "src\Web\kll-storefront\index.html" -Value $indexHtml -Encoding UTF8

# src/index.css
$indexCss = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; }
'@
Set-Content -Path "src\Web\kll-storefront\src\index.css" -Value $indexCss -Encoding UTF8

# Types
$types = @'
export interface Product {
  id: string; name: string; description: string; price: number;
  stockQuantity: number; category: string; categoryId?: string;
  imageUrl?: string; isActive: boolean; createdAt: string;
}
export interface Category {
  id: string; name: string; slug: string; description?: string;
  imageUrl?: string; isActive: boolean; displayOrder: number;
  subCategories?: Category[];
}
export interface CartItem {
  productId: string; productName: string; unitPrice: number;
  quantity: number; total: number; imageUrl?: string;
}
export interface Cart { id: string; items: CartItem[]; total: number; itemCount: number; }
export interface Order {
  id: string; customerId: string; status: string; totalAmount: number;
  createdAt: string; items: OrderItem[];
}
export interface OrderItem { productId: string; productName: string; quantity: number; unitPrice: number; }
export interface PagedResult<T> { items: T[]; totalCount: number; page: number; pageSize: number; totalPages: number; }
export interface User { sub: string; preferred_username: string; email: string; realm_roles: string[]; }
'@
Set-Content -Path "src\Web\kll-storefront\src\types\index.ts" -Value $types -Encoding UTF8

# API Service
$apiService = @'
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5100";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kll_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("kll_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const productApi = {
  search: (params: Record<string, any>) => api.get("/api/v1/products/search", { params }).then((r) => r.data),
  getAll: () => api.get("/api/v1/products").then((r) => r.data),
  getById: (id: string) => api.get(`/api/v1/products/${id}`).then((r) => r.data),
  getByCategory: (catId: string) => api.get(`/api/v1/products/category/${catId}`).then((r) => r.data),
};

export const categoryApi = {
  getAll: () => api.get("/api/v1/categories").then((r) => r.data),
  getTree: () => api.get("/api/v1/categories/tree").then((r) => r.data),
};

export const cartApi = {
  get: () => api.get("/api/v1/cart").then((r) => r.data),
  addItem: (productId: string, quantity = 1) => api.post("/api/v1/cart/items", { productId, quantity }).then((r) => r.data),
  updateItem: (productId: string, quantity: number) => api.put(`/api/v1/cart/items/${productId}`, { quantity }).then((r) => r.data),
  removeItem: (productId: string) => api.delete(`/api/v1/cart/items/${productId}`),
  clear: () => api.delete("/api/v1/cart"),
};

export const orderApi = {
  create: (data: any) => api.post("/api/v1/orders", data).then((r) => r.data),
  getById: (id: string) => api.get(`/api/v1/orders/${id}`).then((r) => r.data),
  getMine: () => api.get("/api/v1/orders/mine").then((r) => r.data),
};

export const authApi = {
  login: (username: string, password: string) =>
    axios.post(
      `${import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8081"}/realms/kll-platform/protocol/openid-connect/token`,
      new URLSearchParams({ grant_type: "password", client_id: "kll-storefront", username, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    ).then((r) => r.data),
  register: (username: string, email: string, password: string, firstName: string, lastName: string) =>
    api.post("/api/v1/auth/register", { username, email, password, firstName, lastName }).then((r) => r.data),
};

export default api;
'@
Set-Content -Path "src\Web\kll-storefront\src\services\api.ts" -Value $apiService -Encoding UTF8

# Auth Store (Zustand)
$authStore = @'
import { create } from "zustand";
import type { User } from "../types";

function parseJwt(token: string): any {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch { return null; }
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null, user: null, isAuthenticated: false, isAdmin: false,
  login: (token) => {
    localStorage.setItem("kll_token", token);
    const decoded = parseJwt(token);
    const user: User = {
      sub: decoded?.sub || "",
      preferred_username: decoded?.preferred_username || "",
      email: decoded?.email || "",
      realm_roles: decoded?.realm_roles || [],
    };
    set({ token, user, isAuthenticated: true, isAdmin: user.realm_roles.includes("admin") });
  },
  logout: () => {
    localStorage.removeItem("kll_token");
    set({ token: null, user: null, isAuthenticated: false, isAdmin: false });
  },
  init: () => {
    const token = localStorage.getItem("kll_token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const user: User = {
          sub: decoded.sub, preferred_username: decoded.preferred_username,
          email: decoded.email, realm_roles: decoded.realm_roles || [],
        };
        set({ token, user, isAuthenticated: true, isAdmin: user.realm_roles.includes("admin") });
      } else { localStorage.removeItem("kll_token"); }
    }
  },
}));
'@
Set-Content -Path "src\Web\kll-storefront\src\store\authStore.ts" -Value $authStore -Encoding UTF8

# Cart Store
$cartStore = @'
import { create } from "zustand";
import { cartApi } from "../services/api";
import type { CartItem } from "../types";

interface CartState {
  items: CartItem[]; total: number; itemCount: number; loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [], total: 0, itemCount: 0, loading: false,
  fetchCart: async () => {
    try {
      const data = await cartApi.get();
      set({ items: data.items || [], total: data.total, itemCount: data.itemCount });
    } catch { set({ items: [], total: 0, itemCount: 0 }); }
  },
  addItem: async (productId, quantity = 1) => {
    const data = await cartApi.addItem(productId, quantity);
    set({ total: data.total, itemCount: data.itemCount });
  },
  updateItem: async (productId, quantity) => {
    const data = await cartApi.updateItem(productId, quantity);
    set({ total: data.total, itemCount: data.itemCount });
  },
  removeItem: async (productId) => {
    await cartApi.removeItem(productId);
  },
  clearCart: async () => {
    await cartApi.clear();
    set({ items: [], total: 0, itemCount: 0 });
  },
}));
'@
Set-Content -Path "src\Web\kll-storefront\src\store\cartStore.ts" -Value $cartStore -Encoding UTF8

# Components - Header
$header = @'
import { Link } from "react-router-dom";
import { FiShoppingCart, FiUser, FiSearch, FiLogOut, FiSettings } from "react-icons/fi";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const { isAuthenticated, user, isAdmin, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [query, setQuery] = useState("");
  const nav = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) nav(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="bg-kll-800 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-accent-400 hover:text-accent-500 transition">
            KLL Store
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produtos..." className="w-full py-2 px-4 pr-10 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-400" />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-kll-600">
                <FiSearch size={20} />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-300">Ola, {user?.preferred_username}</span>
                <Link to="/orders" className="text-sm hover:text-accent-400 transition">Pedidos</Link>
                {isAdmin && (
                  <a href="http://localhost:5173" target="_blank" rel="noreferrer" className="hover:text-accent-400 transition" title="Admin">
                    <FiSettings size={20} />
                  </a>
                )}
                <Link to="/cart" className="relative hover:text-accent-400 transition">
                  <FiShoppingCart size={22} />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <button onClick={logout} className="hover:text-red-400 transition" title="Sair"><FiLogOut size={20} /></button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-accent-400 text-kll-900 px-4 py-2 rounded-lg font-semibold hover:bg-accent-500 transition">
                <FiUser size={18} /> Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
'@
Set-Content -Path "src\Web\kll-storefront\src\components\Header.tsx" -Value $header -Encoding UTF8

# Components - ProductCard
$productCard = @'
import { Link } from "react-router-dom";
import { FiShoppingCart } from "react-icons/fi";
import type { Product } from "../types";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const nav = useNavigate();

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { nav("/login"); return; }
    try {
      await addItem(product.id);
      toast.success(`${product.name} adicionado ao carrinho!`);
    } catch { toast.error("Erro ao adicionar"); }
  };

  const formatPrice = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Link to={`/product/${product.id}`} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="text-6xl text-gray-300">📦</div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-kll-600 font-medium mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-kll-600 transition">{product.name}</h3>
        <p className="text-2xl font-bold text-kll-700">{formatPrice(product.price)}</p>
        <p className="text-xs text-green-600 mt-1">Frete gratis</p>
        <button onClick={handleAdd} className="mt-3 w-full flex items-center justify-center gap-2 bg-kll-600 text-white py-2 rounded-lg hover:bg-kll-700 transition font-medium">
          <FiShoppingCart size={16} /> Comprar
        </button>
      </div>
    </Link>
  );
}
'@
Set-Content -Path "src\Web\kll-storefront\src\components\ProductCard.tsx" -Value $productCard -Encoding UTF8

# Components - Footer
$footer = @'
export default function Footer() {
  return (
    <footer className="bg-kll-900 text-gray-400 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-accent-400 font-bold text-xl mb-3">KLL Store</h3>
            <p className="text-sm">O melhor marketplace para suas compras online. Qualidade e seguranca em cada pedido.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/categories" className="hover:text-white transition">Categorias</a></li>
              <li><a href="/orders" className="hover:text-white transition">Meus Pedidos</a></li>
              <li><a href="/help" className="hover:text-white transition">Ajuda</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Contato</h4>
            <p className="text-sm">suporte@kllstore.com</p>
            <p className="text-sm mt-1">(85) 9 9999-9999</p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
          <p>&copy; 2026 KLL Store. Todos os direitos reservados.</p>
          <p className="text-xs text-gray-500 mt-1">.NET 8 + React 18 + Kafka + PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
}
'@
Set-Content -Path "src\Web\kll-storefront\src\components\Footer.tsx" -Value $footer -Encoding UTF8

# Pages - Home
$homePage = @'
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productApi, categoryApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import type { Product, Category } from "../types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productApi.getAll(), categoryApi.getAll()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-kll-700 to-kll-900 rounded-2xl p-8 md:p-12 mb-8 text-white">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Bem-vindo a KLL Store</h1>
        <p className="text-lg text-gray-300 mb-6">Os melhores produtos com os melhores precos. Frete gratis para todo o Brasil!</p>
        <Link to="/search" className="inline-block bg-accent-400 text-kll-900 px-6 py-3 rounded-lg font-bold hover:bg-accent-500 transition">
          Ver Ofertas
        </Link>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} to={`/search?categoryId=${cat.id}`}
                className="bg-white rounded-xl p-4 text-center shadow hover:shadow-lg transition border border-gray-100 hover:border-kll-300">
                <div className="text-4xl mb-2">{cat.imageUrl || "📁"}</div>
                <p className="font-medium text-gray-700 text-sm">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Produtos em Destaque</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kll-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-lg">Nenhum produto disponivel ainda.</p>
            <p className="text-sm mt-2">Cadastre produtos pelo Admin Panel.</p>
          </div>
        )}
      </section>
    </div>
  );
}
'@
Set-Content -Path "src\Web\kll-storefront\src\pages\Home.tsx" -Value $homePage -Encoding UTF8

# Pages - Login
$loginPage = @'
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { fetchCart } = useCartStore();
  const nav = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      login(data.access_token);
      await fetchCart();
      toast.success("Login realizado com sucesso!");
      nav("/");
    } catch {
      toast.error("Usuario ou senha incorretos");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-kll-800">KLL Store</h1>
          <p className="text-gray-500 mt-2">Entre na sua conta</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kll-500 focus:border-transparent outline-none" placeholder="seu.usuario" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kll-500 focus:border-transparent outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-kll-600 text-white py-3 rounded-lg font-semibold hover:bg-kll-700 transition disabled:opacity-50">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Usuarios de teste:</p>
          <p className="font-mono text-xs mt-1">admin / Admin123! (admin)</p>
          <p className="font-mono text-xs">cliente / Cliente123! (customer)</p>
        </div>
      </div>
    </div>
  );
}
'@
Set-Content -Path "src\Web\kll-storefront\src\pages\Login.tsx" -Value $loginPage -Encoding UTF8

# Pages - Search
$searchPage = @'
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productApi, categoryApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import type { Product, Category } from "../types";

export default function Search() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("newest");

  const q = params.get("q") || "";
  const categoryId = params.get("categoryId") || "";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productApi.search({ q, categoryId: categoryId || undefined, sortBy, pageSize: 40 }),
      categoryApi.getAll(),
    ]).then(([res, cats]) => {
      setProducts(res.items || res);
      setTotal(res.totalCount || res.length || 0);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, [q, categoryId, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {q ? `Resultados para "${q}"` : categoryId ? "Produtos da Categoria" : "Todos os Produtos"}
          <span className="text-sm font-normal text-gray-500 ml-2">({total} encontrados)</span>
        </h1>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-kll-500">
          <option value="newest">Mais Recentes</option>
          <option value="price">Menor Preco</option>
          <option value="name">Nome A-Z</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <h3 className="font-semibold text-gray-700 mb-3">Categorias</h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <a href={`/search?categoryId=${cat.id}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition ${categoryId === cat.id ? "bg-kll-100 text-kll-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}>
                  {cat.name}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kll-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">🔍</p>
              <p>Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'@
Set-Content -Path "src\Web\kll-storefront\src\pages\Search.tsx" -Value $searchPage -Encoding UTF8

# Pages - ProductDetail
$productDetail = @'
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productApi } from "../services/api";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { FiShoppingCart, FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import type { Product } from "../types";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const nav = useNavigate();

  useEffect(() => {
    if (id) productApi.getById(id).then(setProduct).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) { nav("/login"); return; }
    if (!product) return;
    try {
      await addItem(product.id, quantity);
      toast.success(`${product.name} adicionado ao carrinho!`);
    } catch { toast.error("Erro ao adicionar"); }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kll-600"></div></div>;
  if (!product) return <div className="text-center py-20 text-gray-500">Produto nao encontrado</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="bg-gray-100 flex items-center justify-center p-8 min-h-[400px]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-[500px] object-contain" />
            ) : (
              <div className="text-9xl text-gray-300">📦</div>
            )}
          </div>
          <div className="p-8">
            <p className="text-sm text-kll-600 font-medium mb-2">{product.category}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>

            <div className="mb-6">
              <p className="text-4xl font-bold text-kll-700">{fmt(product.price)}</p>
              <p className="text-green-600 text-sm mt-1">Frete gratis • Entrega em ate 5 dias uteis</p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-gray-600">Quantidade:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100"><FiMinus /></button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))} className="px-3 py-2 hover:bg-gray-100"><FiPlus /></button>
              </div>
              <span className="text-xs text-gray-400">({product.stockQuantity} disponiveis)</span>
            </div>

            <button onClick={handleAdd}
              className="w-full flex items-center justify-center gap-3 bg-kll-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-kll-700 transition">
              <FiShoppingCart size={22} /> Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
'@
Set-Content -Path "src\Web\kll-storefront\src\pages\ProductDetail.tsx" -Value $productDetail -Encoding UTF8

# Pages - Cart
$cartPage = @'
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, total, itemCount, fetchCart, updateItem, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { nav("/login"); return; }
    fetchCart().finally(() => setLoading(false));
  }, [isAuthenticated]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleUpdate = async (productId: string, qty: number) => {
    try { await updateItem(productId, qty); await fetchCart(); } catch { toast.error("Erro ao atualizar"); }
  };

  const handleRemove = async (productId: string) => {
    try { await removeItem(productId); await fetchCart(); toast.success("Item removido"); } catch { toast.error("Erro"); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kll-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Carrinho ({itemCount} itens)</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-xl text-gray-500 mb-4">Seu carrinho esta vazio</p>
          <Link to="/" className="inline-block bg-kll-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-kll-700 transition">
            Continuar Comprando
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="text-3xl">📦</span>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{item.productName}</h3>
                <p className="text-kll-600 font-bold">{fmt(item.unitPrice)}</p>
              </div>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => handleUpdate(item.productId, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100"><FiMinus size={14} /></button>
                <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                <button onClick={() => handleUpdate(item.productId, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100"><FiPlus size={14} /></button>
              </div>
              <p className="font-bold text-gray-800 w-24 text-right">{fmt(item.total)}</p>
              <button onClick={() => handleRemove(item.productId)} className="text-red-500 hover:text-red-700 p-2"><FiTrash2 size={18} /></button>
            </div>
          ))}

          <div className="bg-white rounded-xl shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg text-gray-600">Total:</span>
              <span className="text-3xl font-bold text-kll-700">{fmt(total)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { clearCart(); toast.success("Carrinho limpo"); }}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">Limpar</button>
              <Link to="/checkout" className="flex-1 text-center bg-kll-600 text-white py-3 rounded-lg font-bold hover:bg-kll-700 transition">
                Finalizar Compra
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'@
Set-Content -Path "src\Web\kll-storefront\src\pages\CartPage.tsx" -Value $cartPage -Encoding UTF8

# Pages - Checkout
$checkoutPage = @'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { orderApi } from "../services/api";
import toast from "react-hot-toast";

export default function Checkout() {
  const { items, total, clearCart, fetchCart } = useCartStore();
  const { user } = useAuthStore();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    street: "", number: "", complement: "", neighborhood: "", city: "Fortaleza", state: "CE", zipCode: ""
  });

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        customerId: user?.sub,
        customerEmail: user?.email,
        ...form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      };
      const order = await orderApi.create(orderData);
      await clearCart();
      toast.success("Pedido realizado com sucesso!");
      nav(`/order/${order.id}`);
    } catch { toast.error("Erro ao finalizar pedido"); }
    finally { setLoading(false); }
  };

  if (items.length === 0) { nav("/cart"); return null; }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-2">Endereco de Entrega</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Rua</label>
              <input required value={form.street} onChange={(e) => setForm({...form, street: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Numero</label>
              <input required value={form.number} onChange={(e) => setForm({...form, number: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bairro</label>
              <input required value={form.neighborhood} onChange={(e) => setForm({...form, neighborhood: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Complemento</label>
              <input value={form.complement} onChange={(e) => setForm({...form, complement: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Cidade</label>
              <input required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Estado</label>
              <input required value={form.state} onChange={(e) => setForm({...form, state: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" maxLength={2} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">CEP</label>
              <input required value={form.zipCode} onChange={(e) => setForm({...form, zipCode: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-kll-500 outline-none" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition disabled:opacity-50 mt-4">
            {loading ? "Processando..." : `Confirmar Pedido • ${fmt(total)}`}
          </button>
        </form>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Resumo</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.productName} x{item.quantity}</span>
                <span className="font-medium">{fmt(item.total)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-kll-700">{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
'@
Set-Content -Path "src\Web\kll-storefront\src\pages\Checkout.tsx" -Value $checkoutPage -Encoding UTF8

# Pages - Orders
$ordersPage = @'
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { orderApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { Order } from "../types";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const nav = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { nav("/login"); return; }
    orderApi.getMine().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const statusColor: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800", Confirmed: "bg-blue-100 text-blue-800",
    Shipped: "bg-purple-100 text-purple-800", Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kll-600"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Meus Pedidos</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow">
          <p className="text-6xl mb-4">📦</p>
          <p className="text-xl text-gray-500 mb-4">Nenhum pedido realizado</p>
          <Link to="/" className="inline-block bg-kll-600 text-white px-6 py-3 rounded-lg font-semibold">Ir as Compras</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} to={`/order/${order.id}`}
              className="block bg-white rounded-xl shadow p-5 hover:shadow-lg transition">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-mono text-sm text-gray-400">#{order.id.slice(0, 8)}</p>
                  <p className="font-bold text-lg">{fmt(order.totalAmount)}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[order.status] || "bg-gray-100"}`}>
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
'@
Set-Content -Path "src\Web\kll-storefront\src\pages\Orders.tsx" -Value $ordersPage -Encoding UTF8

# App.tsx
$appTsx = @'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";

export default function App() {
  const { init, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order/:id" element={<Orders />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
'@
Set-Content -Path "src\Web\kll-storefront\src\App.tsx" -Value $appTsx -Encoding UTF8

# main.tsx
$mainTsx = @'
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'@
Set-Content -Path "src\Web\kll-storefront\src\main.tsx" -Value $mainTsx -Encoding UTF8

# Storefront Dockerfile
$storefrontDockerfile = @'
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
'@
Set-Content -Path "src\Web\kll-storefront\Dockerfile" -Value $storefrontDockerfile -Encoding UTF8

# nginx.conf for storefront
$nginxConf = @'
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://gateway:5100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
'@
Set-Content -Path "src\Web\kll-storefront\nginx.conf" -Value $nginxConf -Encoding UTF8

# .dockerignore
Set-Content -Path "src\Web\kll-storefront\.dockerignore" -Value "node_modules`ndist`n.env" -Encoding UTF8

Write-Host "  OK: Storefront completo (15 arquivos)" -ForegroundColor Green

# ============================================================
# FASE 12: UPDATE docker-compose.yml (add storefront)
# ============================================================
Write-Host "`n[12/12] Update docker-compose.yml..." -ForegroundColor Yellow

$composeContent = Get-Content "docker-compose.yml" -Raw
if ($composeContent -notmatch "storefront") {
    $composeContent = $composeContent -replace '(  admin-web:)', @"
  storefront:
    build:
      context: src/Web/kll-storefront
      dockerfile: Dockerfile
    container_name: kll-storefront
    ports:
      - "5174:80"
    depends_on:
      - gateway
    networks:
      - kll-net

  admin-web:
"@
    Set-Content -Path "docker-compose.yml" -Value $composeContent -Encoding UTF8
    Write-Host "  OK: docker-compose.yml updated with storefront" -ForegroundColor Green
} else {
    Write-Host "  SKIP: storefront already in docker-compose.yml" -ForegroundColor DarkYellow
}

# ============================================================
# FINAL: Install storefront dependencies
# ============================================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Upgrade Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  1. cd src\Web\kll-storefront && npm install" -ForegroundColor White
Write-Host "  2. Remover migrations antigas e regerar:" -ForegroundColor White
Write-Host "     Remove-Item src\Services\KLL.Store\KLL.Store.Infra.Data\Migrations\* -Force" -ForegroundColor Gray
Write-Host "     dotnet ef migrations add AddCategoriesAndCart --project src\Services\KLL.Store\KLL.Store.Infra.Data --startup-project src\Services\KLL.Store\KLL.Store.Api" -ForegroundColor Gray
Write-Host "  3. docker compose --profile auth up -d (subir com Keycloak)" -ForegroundColor White
Write-Host "  4. cd src\Web\kll-storefront && npm run dev" -ForegroundColor White
Write-Host "  5. Acessar http://localhost:5174 (Storefront)" -ForegroundColor White
Write-Host ""
Write-Host "Usuarios:" -ForegroundColor Yellow
Write-Host "  admin / Admin123! (role: admin)" -ForegroundColor White
Write-Host "  cliente / Cliente123! (role: customer)" -ForegroundColor White
Write-Host ""
Write-Host "Portas:" -ForegroundColor Yellow
Write-Host "  5174 = Storefront (loja)" -ForegroundColor White
Write-Host "  5173 = Admin Panel" -ForegroundColor White
Write-Host "  5100 = Gateway" -ForegroundColor White
Write-Host "  8081 = Keycloak" -ForegroundColor White
