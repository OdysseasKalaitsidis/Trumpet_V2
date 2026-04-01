using Microsoft.AspNetCore.Mvc;
using Trumpet.Backend.Models;
using Trumpet.Backend.Services.Collections;
using Microsoft.AspNetCore.Cors;

namespace Trumpet.Backend.Controllers;

[ApiController]
[EnableCors("AllowAll")]
[Route("api/[controller]")]
public class CollectionsController : ControllerBase
{
    private readonly ICollectionsService _collectionsService;

    public CollectionsController(ICollectionsService collectionsService)
    {
        _collectionsService = collectionsService;
    }

    /// <summary>
    /// Get all collections
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Collection>>> GetCollections()
    {
        return Ok(await _collectionsService.GetCollectionsAsync());
    }

    /// <summary>
    /// Get collection ID to name mappings for frontend filters
    /// Returns: [{ id: "uuid", name: "Collection Name" }, ...]
    /// </summary>
    [HttpGet("mappings")]
    public async Task<ActionResult<IEnumerable<object>>> GetCollectionMappings()
    {
        return Ok(await _collectionsService.GetCollectionMappingsAsync());
    }

    /// <summary>
    /// Get a specific collection by ID with its items
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Collection>> GetCollection(string id)
    {
        var collection = await _collectionsService.GetCollectionAsync(id);

        if (collection == null)
            return NotFound();

        return Ok(collection);
    }
}
