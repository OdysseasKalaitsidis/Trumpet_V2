using Microsoft.Extensions.FileProviders;
using Microsoft.EntityFrameworkCore;
using Trumpet.Net.Data;
using Trumpet.Net.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
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
    options.UseSqlite("Data Source=corfiot_music.db"));

// Import Service
builder.Services.AddScoped<IDataImportService, DataImportService>();

var app = builder.Build();

app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Serve media files
var outPath = Path.Combine(builder.Environment.ContentRootPath, "../out"); // Assuming 'out' is sibling to Trumpet_Net folder
if (!Directory.Exists(outPath))
{
    // Fallback or try to find it relative to current dir if running differently
    outPath = Path.Combine(Directory.GetCurrentDirectory(), "out");
}

if (Directory.Exists(outPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(outPath),
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