using Microsoft.AspNetCore.Mvc;
using Trumpet.Backend.Models;
using Trumpet.Backend.Services.Items;
using Trumpet.Backend.Services.Tagging;
using Trumpet.Backend.Services.Recommendations;
using Microsoft.AspNetCore.Cors;

namespace Trumpet.Backend.Controllers;

[ApiController]
[EnableCors("AllowAll")]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly IItemsService _itemsService;
    private readonly ITaggingService _taggingService;
    private readonly IRecommendationService _recommendationService;

    public ItemsController(IItemsService itemsService, ITaggingService taggingService, IRecommendationService recommendationService)
    {
        _itemsService = itemsService;
        _taggingService = taggingService;
        _recommendationService = recommendationService;
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
        [FromQuery] string? collectionId,
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10)
    {
        return Ok(await _itemsService.GetItemsAsync(path, search, communityId, collectionId, page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> GetItem(string id)
    {
        var item = await _itemsService.GetItemAsync(id);

        if (item == null)
        {
            return NotFound();
        }

        // Ensure tags are loaded/displayed in Metadata (they are part of MetadataValues so they should be there)
        return Ok(item);
    }

    [HttpPost("{id}/tags/generate")]
    public async Task<ActionResult<List<string>>> GenerateTags(string id)
    {
        var item = await _itemsService.GetItemAsync(id);
        if (item == null) return NotFound();

        var tags = await _taggingService.GenerateTagsAsync(item);
        // Note: The service doesn't save them automatically in this method reference, 
        // but for the sake of the API we might want to save them here or have the service do it.
        // The Backfill method saves. The GenerateTagsAsync just returns.
        // Let's implement saving here for single item.
        
        // Actually, let's just use the backfill logic or similar manually here for now, 
        // to avoid complicating the Interface. Ideally TaggingService.AssignTags(sessionId)
        // For MVP: Just return them.
        return Ok(tags);
    }

    [HttpPost("tags/generate-all")]
    public async Task<ActionResult> GenerateAllTags()
    {
        await _taggingService.BackfillTagsAsync();
        return Ok("Tag generation started/completed.");
    }

    [HttpGet("{id}/recommendations")]
    public async Task<ActionResult<IEnumerable<Item>>> GetRecommendations(string id)
    {
        var recommendations = await _recommendationService.GetRecommendationsAsync(id);
        return Ok(recommendations);
    }
}
