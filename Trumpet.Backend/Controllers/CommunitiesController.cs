using Microsoft.AspNetCore.Mvc;
using Trumpet.Backend.Models;
using Trumpet.Backend.Services.Communities;
using Microsoft.AspNetCore.Cors;

namespace Trumpet.Backend.Controllers;

[ApiController]
[EnableCors("AllowAll")]
[Route("api/[controller]")]
public class CommunitiesController : ControllerBase
{
    private readonly ICommunitiesService _communitiesService;

    public CommunitiesController(ICommunitiesService communitiesService)
    {
        _communitiesService = communitiesService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Community>>> GetCommunities([FromQuery] string? path)
    {
        return Ok(await _communitiesService.GetCommunitiesAsync(path));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Community>> GetCommunity(string id)
    {
        var community = await _communitiesService.GetCommunityAsync(id);

        if (community == null)
            return NotFound();

        return Ok(community);
    }
}
