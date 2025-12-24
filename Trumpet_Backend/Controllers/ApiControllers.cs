using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Trumpet.Shared;
using Trumpet.Net.Services;

namespace Trumpet.Net.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly MusicContext _context;

    public ItemsController(MusicContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Item>>> GetItems([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        return await _context.Items
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
