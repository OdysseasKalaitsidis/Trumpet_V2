using Trumpet.Backend.Models;

namespace Trumpet.Backend.Services.CommunityItems;

public interface ICommunityItemsService
{
    Task<IEnumerable<Item>> GetItemsByCommunityIdAsync(string communityId);
}
