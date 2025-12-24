using Trumpet.Backend.Models;

namespace Trumpet.Backend.Services.Communities;

public interface ICommunitiesService
{
    Task<IEnumerable<Community>> GetCommunitiesAsync(string? path);
    Task<Community?> GetCommunityAsync(string id);
}
