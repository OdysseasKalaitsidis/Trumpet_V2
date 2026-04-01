using Microsoft.EntityFrameworkCore;
using Trumpet.Backend.Data;
using Trumpet.Backend.Models;

namespace Trumpet.Backend.Services.Collections;

public class CollectionsService : ICollectionsService
{
    private readonly MusicContext _context;

    public CollectionsService(MusicContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Collection>> GetCollectionsAsync()
    {
        return await _context.Collections.ToListAsync();
    }

    public async Task<Collection?> GetCollectionAsync(string id)
    {
        return await _context.Collections
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    /// <summary>
    /// Returns a list of collection ID to name mappings for frontend dropdown/filter purposes
    /// </summary>
    public async Task<IEnumerable<object>> GetCollectionMappingsAsync()
    {
        return await _context.Collections
            .Select(c => new { c.Id, c.Name })
            .ToListAsync<object>();
    }
}
