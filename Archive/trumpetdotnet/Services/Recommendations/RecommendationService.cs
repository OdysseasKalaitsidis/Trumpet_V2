using Microsoft.EntityFrameworkCore;
using Trumpet.Backend.Data;
using Trumpet.Backend.Models;

namespace Trumpet.Backend.Services.Recommendations;

public class RecommendationService : IRecommendationService
{
    private readonly MusicContext _context;

    public RecommendationService(MusicContext context)
    {
        _context = context;
    }

    public async Task<List<Item>> GetRecommendationsAsync(string itemId, int maxResults = 5)
    {
        // 1. Get the tags of the source item
        var sourceTags = await _context.MetadataValues
            .Where(m => m.ItemId == itemId && m.Field == "trumpet.tag")
            .Select(m => m.Value)
            .ToListAsync();

        if (!sourceTags.Any())
        {
            return new List<Item>();
        }

        // 2. Find other items that have these tags
        // We want to count how many matching tags each item has
        var recommendations = await _context.MetadataValues
            // Filter only tag fields
            .Where(m => m.Field == "trumpet.tag" && m.ItemId != itemId && sourceTags.Contains(m.Value))
            // Group by ItemId
            .GroupBy(m => m.ItemId)
            // Select ItemId and Count
            .Select(g => new { ItemId = g.Key, MatchCount = g.Count() })
            // Order by matches descending
            .OrderByDescending(x => x.MatchCount)
            .Take(maxResults)
            .ToListAsync();

        var recommendedItemIds = recommendations.Select(r => r.ItemId).ToList();

        if (!recommendedItemIds.Any())
        {
            return new List<Item>();
        }

        // 3. Fetch the actual Items
        var items = await _context.Items
            .Include(i => i.Metadata)
            .Include(i => i.Collection) // Include collection just in case
            .Where(i => recommendedItemIds.Contains(i.Id))
            .ToListAsync();
            
        // Re-sort in memory because SQL IN clause doesn't guarantee order
        return items
            .OrderByDescending(i => recommendations.First(r => r.ItemId == i.Id).MatchCount)
            .ToList();
    }
}
