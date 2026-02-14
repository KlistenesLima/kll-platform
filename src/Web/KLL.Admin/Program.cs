using MudBlazor.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();
builder.Services.AddMudServices();
builder.Services.AddHttpClient("StoreApi", c => c.BaseAddress = new Uri("http://localhost:5200"));
builder.Services.AddHttpClient("PayApi", c => c.BaseAddress = new Uri("http://localhost:5300"));
builder.Services.AddHttpClient("LogisticsApi", c => c.BaseAddress = new Uri("http://localhost:5400"));

var app = builder.Build();
app.UseStaticFiles();
app.UseRouting();
app.MapBlazorHub();
app.MapFallbackToPage("/_Host");
app.Run();