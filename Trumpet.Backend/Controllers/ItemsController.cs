using Microsoft.AspNetCore.Mvc;
using Trumpet.Backend.Models;
using Trumpet.Backend.Services.Items;
using Microsoft.AspNetCore.Cors;

namespace Trumpet.Backend.Controllers;

[ApiController]
[EnableCors("AllowAll")]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly IItemsService _itemsService;

    public ItemsController(IItemsService itemsService)
    {
        _itemsService = itemsService;
    }

    [HttpGet("fields")]
    public async Task<ActionResult<IEnumerable<string>>> GetFields()
    {
        return Ok(await _itemsService.GetFieldsAsync());
    }

    [HttpGet("path-values")]
    public async Task<ActionResult<IEnumerable<string>>> GetPathValues()
    {
        return Ok(await _itemsService.GetPathValuesAsync());
    }

    [HttpGet("path-counts")]
    public async Task<ActionResult<IEnumerable<object>>> GetPathCounts()
    {
        return Ok(await _itemsService.GetPathCountsAsync());
    }

    [HttpGet("search-all")]
    public async Task<ActionResult<IEnumerable<object>>> SearchAllMetadata([FromQuery] string value)
    {
        return Ok(await _itemsService.SearchAllMetadataAsync(value));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Item>>> GetItems(
        [FromQuery] string? path, 
        [FromQuery] string? search, 
        [FromQuery] string? communityId,
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        return Ok(await _itemsService.GetItemsAsync(path, search, communityId, page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> GetItem(string id)
    {
        var item = await _itemsService.GetItemAsync(id);

        if (item == null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
