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
        Console.WriteLine($"[CommunityItemsService] Getting items for communityId: {communityId}");
        
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

        Console.WriteLine($"[CommunityItemsService] All community IDs (including sub-communities): {string.Join(", ", allCommunityIds)}");

        // Check what collections exist for these communities
        var collections = await _context.Collections
            .Where(c => c.ParentCommunityId != null && allCommunityIds.Contains(c.ParentCommunityId))
            .ToListAsync();
        
        Console.WriteLine($"[CommunityItemsService] Found {collections.Count} collections for these communities:");
        foreach (var col in collections)
        {
            Console.WriteLine($"  - Collection: {col.Id} | Name: {col.Name} | ParentCommunityId: {col.ParentCommunityId}");
        }

        // Check all collections to see what ParentCommunityIds they have
        var allCollections = await _context.Collections.Take(10).ToListAsync();
        Console.WriteLine($"[CommunityItemsService] Sample of all collections (first 10):");
        foreach (var col in allCollections)
        {
            Console.WriteLine($"  - Collection: {col.Id} | ParentCommunityId: {col.ParentCommunityId ?? "NULL"}");
        }

        // Fetch items from collections belonging to any of the found communities
        var items = await _context.Items
            .Include(i => i.Metadata)
            .Include(i => i.Bitstreams)
            .Where(i => i.CollectionId != null && _context.Collections.Any(c => allCommunityIds.Contains(c.ParentCommunityId) && c.Id == i.CollectionId))
            .OrderBy(i => i.Name)
            .ToListAsync();

        Console.WriteLine($"[CommunityItemsService] Returning {items.Count} items");
        
        return items;
    }
}

