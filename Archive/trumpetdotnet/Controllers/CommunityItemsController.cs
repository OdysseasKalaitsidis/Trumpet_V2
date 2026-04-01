using Microsoft.AspNetCore.Mvc;
using Trumpet.Backend.Models;
using Trumpet.Backend.Services.CommunityItems;
using Microsoft.AspNetCore.Cors;

namespace Trumpet.Backend.Controllers;

[ApiController]
[EnableCors("AllowAll")]
[Route("api/[controller]")]
public class CommunityItemsController : ControllerBase
{
    private readonly ICommunityItemsService _service;

    public CommunityItemsController(ICommunityItemsService service)
    {
        _service = service;
    }

    [HttpGet("{communityId}")]
    public async Task<ActionResult<IEnumerable<Item>>> GetCommunityItems(string communityId)
    {
        var items = await _service.GetItemsByCommunityIdAsync(communityId);
        return Ok(items);
    }
}
