using Microsoft.EntityFrameworkCore;
using Trumpet.Backend.Data;
using Trumpet.Backend.Models;

namespace Trumpet.Backend.Services.Communities;

public class CommunitiesService : ICommunitiesService
{
    private readonly MusicContext _context;

    public CommunitiesService(MusicContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Community>> GetCommunitiesAsync(string? path)
    {
        IQueryable<Community> query = _context.Communities
            .Include(c => c.Collections);

        if (!string.IsNullOrEmpty(path))
        {
            switch (path)
            {
                case "ArtMusic":
                    query = query.Where(c => c.IntroductoryText != null && (c.IntroductoryText.Contains("Art music") || c.IntroductoryText.Contains("Art") || c.IntroductoryText.Contains("μουσική του άστεως") || c.IntroductoryText.Contains("Μουσική του Άστεως")));
                    break;
                case "UrbanPopular":
                    query = query.Where(c => c.IntroductoryText != null && (c.IntroductoryText.Contains("Urban popular music") || c.IntroductoryText.Contains("Urban") || c.IntroductoryText.Contains("αστικολαϊκή μουσική") || c.IntroductoryText.Contains("Αστικολαϊκή μουσική")));
                    break;
                case "RuralMusic":
                    query = query.Where(c => c.IntroductoryText != null && (c.IntroductoryText.Contains("Rural music") || c.IntroductoryText.Contains("Rural") || c.IntroductoryText.Contains("μουσική της υπαίθρου") || c.IntroductoryText.Contains("Μουσική της υπαίθρου")));
                    break;
                case "SacredMusic":
                    query = query.Where(c => c.IntroductoryText != null && (c.IntroductoryText.Contains("Sacred music") || c.IntroductoryText.Contains("Sacred") || c.IntroductoryText.Contains("εκκλησιαστική μουσική") || c.IntroductoryText.Contains("Εκκλησιαστική μουσική")));
                    break;
            }
        }

        return await query.ToListAsync();
    }

    public async Task<Community?> GetCommunityAsync(string id)
    {
        return await _context.Communities
            .Include(c => c.Collections)
            .FirstOrDefaultAsync(c => c.Id == id);
    }
}
