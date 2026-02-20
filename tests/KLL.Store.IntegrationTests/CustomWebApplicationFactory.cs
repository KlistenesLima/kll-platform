using KLL.BuildingBlocks.EventBus.Interfaces;
using KLL.Store.Infra.Data.Context;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Moq;

namespace KLL.Store.IntegrationTests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Remove real DB
            services.RemoveAll<DbContextOptions<StoreDbContext>>();
            services.RemoveAll<StoreDbContext>();
            services.RemoveAll(typeof(DbContext));

            // Add InMemory DB (shared across requests in the same factory)
            var dbName = "TestDb_" + Guid.NewGuid();
            services.AddDbContext<StoreDbContext>(opt =>
                opt.UseInMemoryDatabase(dbName));
            services.AddScoped<DbContext>(sp => sp.GetRequiredService<StoreDbContext>());

            // Replace EventBus with mock
            services.RemoveAll<IEventBus>();
            var mockEventBus = new Mock<IEventBus>();
            services.AddSingleton(mockEventBus.Object);

            // Replace INotificationBus with mock
            services.RemoveAll<INotificationBus>();
            var mockNotificationBus = new Mock<INotificationBus>();
            services.AddSingleton(mockNotificationBus.Object);

            // Replace Redis cache with in-memory
            services.RemoveAll<IDistributedCache>();
            services.AddDistributedMemoryCache();

            // Remove hosted services (Kafka consumers)
            services.RemoveAll<IHostedService>();

            // Remove health checks that need real infra
            services.AddHealthChecks();

            // Override authentication completely
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = "Test";
                options.DefaultChallengeScheme = "Test";
                options.DefaultScheme = "Test";
            })
            .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });

            // Re-add authorization policies (they use realm_roles)
            services.AddAuthorization(opt =>
            {
                opt.DefaultPolicy = new AuthorizationPolicyBuilder("Test")
                    .RequireAuthenticatedUser()
                    .Build();
                opt.AddPolicy("AdminOnly", p => p
                    .AddAuthenticationSchemes("Test")
                    .RequireRole("admin"));
                opt.AddPolicy("CustomerOnly", p => p
                    .AddAuthenticationSchemes("Test")
                    .RequireRole("customer"));
            });
        });
    }
}
