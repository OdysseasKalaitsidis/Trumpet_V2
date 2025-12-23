using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Trumpet.Net.Models;
using Trumpet.Net.Data;
using Trumpet.Net.Services;

using Microsoft.AspNetCore.Cors;

namespace Trumpet.Net.Controllers;

[ApiController]
[EnableCors("AllowAll")]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly MusicContext _context;

    public ItemsController(MusicContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Item>>> GetItems([FromQuery] string? path, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        IQueryable<Item> query = _context.Items
            .Include(i => i.Metadata)
            .Include(i => i.Bitstreams)
            .Where(i => i.Bitstreams.Count > 0);

        if (!string.IsNullOrEmpty(path))
        {
            var searchValues = new List<string>();
            switch (path)
            {
                case "ArtMusic":
                    searchValues.AddRange(new[] { "Art music", "Μουσική του Άστεως", "Μουσική του άστεως" });
                    break;
                case "UrbanPopular":
                    searchValues.AddRange(new[] { "Urban popular music", "Αστικολαϊκή μουσική" });
                    break;
                case "RuralMusic":
                    searchValues.AddRange(new[] { "Rural music", "Μουσική της υπαίθρου" });
                    break;
                case "SacredMusic":
                    searchValues.AddRange(new[] { "Sacred music", "Εκκλησιαστική μουσική" });
                    break;
            }

            if (searchValues.Any())
            {
                query = query.Where(i => i.Metadata.Any(m => m.Field == "dc.musicsubpath" && searchValues.Contains(m.Value)));
            }
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(i => i.Name.Contains(search) || i.Metadata.Any(m => m.Value.Contains(search)));
        }

        return await query
            .OrderBy(i => i.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> GetItem(string id)
    {
        var item = await _context.Items
            .Include(i => i.Metadata)
            .Include(i => i.Bitstreams)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            return NotFound();
        }

        return item;
    }
}

[ApiController]
[Route("api/[controller]")]
public class ImportController : ControllerBase
{
    private readonly IDataImportService _importService;

    public ImportController(IDataImportService importService)
    {
        _importService = importService;
    }

    [HttpPost("extract")]
    public IActionResult RunImport()
    {
        // Run in background ideally, but for now synchronous or Task.Run
        Task.Run(() => _importService.ImportData());
        return Ok("Import started in background.");
    }
}
