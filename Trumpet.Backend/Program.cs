using Microsoft.Extensions.FileProviders;
using Microsoft.EntityFrameworkCore;
using Trumpet.Backend.Data;
using Trumpet.Backend.Services;
using Trumpet.Backend.Services.Items;
using Trumpet.Backend.Services.Communities;
using Trumpet.Backend.Services.CommunityItems;
using Trumpet.Backend.Services.Tagging;
using Trumpet.Backend.Services.Recommendations;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Database
builder.Services.AddDbContext<MusicContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Services
builder.Services.AddScoped<IDataImportService, DataImportService>();
builder.Services.AddScoped<IItemsService, ItemsService>();
builder.Services.AddScoped<ICommunitiesService, CommunitiesService>();
builder.Services.AddScoped<ICommunityItemsService, CommunityItemsService>();
builder.Services.AddScoped<ITaggingService, AITaggingService>();
builder.Services.AddScoped<IRecommendationService, RecommendationService>();

var app = builder.Build();

app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serve media files
var resourcesPath = builder.Configuration["ProjectSettings:ResourcesPath"] ?? "../resources";
if (!Path.IsPathRooted(resourcesPath))
{
    resourcesPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, resourcesPath));
}

if (Directory.Exists(resourcesPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(resourcesPath),
        RequestPath = "/media",
        OnPrepareResponse = ctx =>
        {
            ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
            ctx.Context.Response.Headers.Append("Access-Control-Allow-Headers", "*");
        }
    });
}

app.UseAuthorization();
app.MapControllers();

// Optional: Run import on startup if needed or just ensure DB created
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MusicContext>();
    db.Database.EnsureCreated();
}

app.Run();
