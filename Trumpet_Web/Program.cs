using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddDbContext<MusicContext>(); // Register our database

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();

// 1. Enable standard static files (wwwroot)
app.UseStaticFiles();

// 2. ENABLE ACCESS TO YOUR DOWNLOADED FILES
// We map the URL "/media" to your physical "out" folder
string outPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "../out"));

if (Directory.Exists(outPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(outPath),
        RequestPath = "/media",
        ServeUnknownFileTypes = true // Allow serving weird file extensions if any
    });
    Console.WriteLine($"[WEB] Serving media from: {outPath}");
}
else
{
    Console.WriteLine($"[ERROR] Could not find 'out' folder at: {outPath}");
}

app.UseRouting();
app.UseAuthorization();
app.MapRazorPages();

app.Run();