using Microsoft.EntityFrameworkCore;
using Trumpet.Net.Data;
using Trumpet.Net.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
builder.Services.AddDbContext<MusicContext>(options =>
    options.UseSqlite("Data Source=corfiot_music.db"));

// Import Service
builder.Services.AddScoped<IDataImportService, DataImportService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
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