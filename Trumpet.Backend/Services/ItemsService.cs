using Microsoft.EntityFrameworkCore;
using Trumpet.Backend.Data;
using Trumpet.Backend.Models;

namespace Trumpet.Backend.Services.Items;

public class ItemsService : IItemsService
{
    private readonly MusicContext _context;

    public ItemsService(MusicContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<string>> GetFieldsAsync()
    {
        return await _context.MetadataValues
            .Select(m => m.Field)
            .Distinct()
            .ToListAsync();
    }

    public async Task<IEnumerable<string>> GetPathValuesAsync()
    {
        return await _context.MetadataValues
            .Where(m => m.Field == "dc.musicsubpath" && m.Language == "en")
            .Select(m => m.Value)
            .Distinct()
            .ToListAsync();
    }

    public async Task<IEnumerable<object>> GetPathCountsAsync()
    {
        return await _context.MetadataValues
            .Where(m => m.Field == "dc.musicsubpath" && m.Language == "en")
            .GroupBy(m => m.Value)
            .Select(g => new { Value = g.Key, Count = g.Count() })
            .ToListAsync<object>();
    }

    public async Task<IEnumerable<object>> SearchAllMetadataAsync(string value)
    {
        return await _context.MetadataValues
            .Where(m => m.Value.Contains(value))
            .GroupBy(m => m.Field)
            .Select(g => new { Field = g.Key, Count = g.Count() })
            .ToListAsync<object>();
    }

    public async Task<IEnumerable<Item>> GetItemsAsync(string? path, string? search, string? communityId, string? collectionId, int page, int pageSize)
    {
        IQueryable<Item> query = _context.Items
            .Include(i => i.Metadata)
            .Include(i => i.Bitstreams);

        if (!string.IsNullOrEmpty(path))
        {
            var searchValues = new List<string>();
            switch (path)
            {
                case "ArtMusic":
                    searchValues.AddRange(new[] { "Art music", "Μουσική του άστεως", "Μουσική του Άστεως", "Art" });
                    break;
                case "UrbanPopular":
                    searchValues.AddRange(new[] { "Urban popular music", "Αστικολαϊκή μουσική", "Urban" });
                    break;
                case "RuralMusic":
                    searchValues.AddRange(new[] { "Rural music", "Μουσική της υπαίθρου", "Rural" });
                    break;
                case "SacredMusic":
                    searchValues.AddRange(new[] { "Sacred music", "Εκκλησιαστική μουσική", "Sacred" });
                    break;
            }

            if (searchValues.Any())
            {
                query = query.Where(i => i.Metadata.Any(m => m.Field == "dc.musicsubpath" && searchValues.Any(sv => m.Value.Contains(sv))));
            }
        }

        if (!string.IsNullOrEmpty(communityId))
        {
            query = query.Where(i => i.CollectionId != null && _context.Collections.Any(c => c.Id == i.CollectionId && c.ParentCommunityId == communityId));
        }

<<<<<<< HEAD:Trumpet.Backend/Services/Items/ItemsService.cs
=======
        // Filter by collection ID
>>>>>>> 5dd90944b3a00ebaa33fd1a726e1e8cb20bf0166:Trumpet.Backend/Services/ItemsService.cs
        if (!string.IsNullOrEmpty(collectionId))
        {
            query = query.Where(i => i.CollectionId == collectionId);
        }

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(i => i.Name.Contains(search) || i.Metadata.Any(m => m.Value.Contains(search)));
        }

        return await query
            .OrderBy(i => i.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<Item?> GetItemAsync(string id)
    {
        return await _context.Items
            .Include(i => i.Metadata)
            .Include(i => i.Bitstreams)
            .FirstOrDefaultAsync(i => i.Id == id);
    }
}
