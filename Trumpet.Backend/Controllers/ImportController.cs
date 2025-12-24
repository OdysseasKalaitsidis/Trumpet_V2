using Microsoft.AspNetCore.Mvc;
using Trumpet.Backend.Services;

namespace Trumpet.Backend.Controllers;

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
