using KLL.Store.Infra.Data.Context;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KLL.Store.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly StoreDbContext _db;

    public DashboardController(StoreDbContext db) => _db = db;

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var thirtyDaysAgo = now.AddDays(-30).Date;

        var orders = await _db.Orders
            .Include(o => o.Items)
            .Where(o => o.CreatedAt >= startOfMonth)
            .ToListAsync(ct);

        var allOrders = await _db.Orders
            .Include(o => o.Items)
            .ToListAsync(ct);

        var paidStatuses = new[] { "Paid", "Shipped", "Delivered", "Processing" };

        var paidOrders = orders.Where(o => paidStatuses.Contains(o.Status.ToString())).ToList();
        var totalRevenue = paidOrders.Sum(o => o.TotalAmount.Amount);
        var totalOrders = orders.Count;
        var averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0m;
        var totalCustomers = orders.Select(o => o.CustomerId).Distinct().Count();
        var pendingOrders = orders.Count(o => o.Status.ToString() == "Pending");

        var lowStockProducts = await _db.Products
            .CountAsync(p => p.IsActive && p.StockQuantity <= 5, ct);

        // Revenue by day (last 30 days)
        var revenueByDay = allOrders
            .Where(o => o.CreatedAt.Date >= thirtyDaysAgo && paidStatuses.Contains(o.Status.ToString()))
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new
            {
                date = g.Key.ToString("yyyy-MM-dd"),
                revenue = g.Sum(o => o.TotalAmount.Amount),
                orders = g.Count()
            })
            .OrderBy(x => x.date)
            .ToList();

        // Fill missing days with zero
        var allDays = Enumerable.Range(0, (now.Date - thirtyDaysAgo).Days + 1)
            .Select(i => thirtyDaysAgo.AddDays(i).ToString("yyyy-MM-dd"))
            .ToList();

        var revenueByDayFilled = allDays.Select(day =>
        {
            var existing = revenueByDay.FirstOrDefault(r => r.date == day);
            return new { date = day, revenue = existing?.revenue ?? 0m, orders = existing?.orders ?? 0 };
        }).ToList();

        // Top 5 products by quantity sold
        var topProducts = allOrders
            .Where(o => paidStatuses.Contains(o.Status.ToString()))
            .SelectMany(o => o.Items)
            .GroupBy(i => i.ProductId)
            .Select(g => new
            {
                id = g.Key,
                name = g.First().ProductName,
                soldCount = g.Sum(i => i.Quantity),
                revenue = g.Sum(i => i.UnitPrice * i.Quantity)
            })
            .OrderByDescending(x => x.soldCount)
            .Take(5)
            .ToList();

        // Enrich with image URLs
        var topProductIds = topProducts.Select(p => p.id).ToList();
        var productImages = await _db.Products
            .Where(p => topProductIds.Contains(p.Id))
            .Select(p => new { p.Id, p.ImageUrl })
            .ToListAsync(ct);

        var topProductsWithImages = topProducts.Select(p => new
        {
            p.id,
            p.name,
            imageUrl = productImages.FirstOrDefault(img => img.Id == p.id)?.ImageUrl,
            p.soldCount,
            p.revenue
        }).ToList();

        // Recent orders (last 5)
        var recentOrders = allOrders
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new
            {
                id = o.Id,
                customerName = o.CustomerEmail,
                total = o.TotalAmount.Amount,
                status = o.Status.ToString(),
                createdAt = o.CreatedAt
            })
            .ToList();

        // Orders by status
        var ordersByStatus = allOrders
            .GroupBy(o => o.Status.ToString())
            .ToDictionary(g => g.Key, g => g.Count());

        foreach (var status in new[] { "Pending", "Paid", "Processing", "Shipped", "Delivered", "Cancelled" })
        {
            if (!ordersByStatus.ContainsKey(status))
                ordersByStatus[status] = 0;
        }

        return Ok(new
        {
            totalRevenue,
            totalOrders,
            averageTicket,
            totalCustomers,
            pendingOrders,
            lowStockProducts,
            revenueByDay = revenueByDayFilled,
            topProducts = topProductsWithImages,
            recentOrders,
            ordersByStatus
        });
    }
}
