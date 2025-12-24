using Microsoft.EntityFrameworkCore;
using Trumpet.Backend.Data;
using Trumpet.Backend.Models;

namespace Trumpet.Backend.Services.CommunityItems;

public class CommunityItemsService : ICommunityItemsService
{
    private readonly MusicContext _context;

    public CommunityItemsService(MusicContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Item>> GetItemsByCommunityIdAsync(string communityId)
    {
        // Get all sub-community IDs recursively
        var allCommunityIds = new List<string> { communityId };
        var currentLevelIds = new List<string> { communityId };

        while (currentLevelIds.Any())
        {
            var searchIds = currentLevelIds;
            var nextLevelIds = await _context.Communities
                .Where(c => c.ParentCommunityId != null && searchIds.Contains(c.ParentCommunityId))
                .Select(c => c.Id)
                .ToListAsync();
            
            if (!nextLevelIds.Any()) break;

            allCommunityIds.AddRange(nextLevelIds);
            currentLevelIds = nextLevelIds;
        }

        // Fetch items from collections belonging to any of the found communities
        return await _context.Items
            .Include(i => i.Metadata)
            .Include(i => i.Bitstreams)
            .Where(i => i.CollectionId != null && _context.Collections.Any(c => allCommunityIds.Contains(c.ParentCommunityId) && c.Id == i.CollectionId))
            .OrderBy(i => i.Name)
            .ToListAsync();
    }
}
