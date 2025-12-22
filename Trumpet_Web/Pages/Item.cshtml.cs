using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Trumpet.Net.Models;

namespace Trumpet_Web.Pages
{
    public class ItemModel : PageModel
    {
        private readonly MusicContext _db;

        public ItemModel(MusicContext db)
        {
            _db = db;
        }

        public Item Item { get; set; } = new();
        public Bitstream? CoverImage { get; set; }

        public async Task<IActionResult> OnGetAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return NotFound();
            }

            var item = await _db.Items
                .Include(i => i.Metadata)
                .Include(i => i.Bitstreams)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (item == null)
            {
                return NotFound();
            }

            Item = item;

            // --- AUTO-LINKING LOGIC START ---
            // The data separates Scores and Recordings. We want to show audio on the Score page.
            // Strategy: Find items with the same Creator and overlapping Title.
            
            // 1. Get Creator (first one is usually enough)
            var creatorMeta = Item.Metadata.FirstOrDefault(m => m.Field == "dc.creator");
            if (creatorMeta != null)
            {
                // 2. Search for related items
                // Note: SQLite string comparison is case-sensitive usually, but EF Core might normalize.
                // We use simple substring match on Name.
                var relatedItems = await _db.Items
                    .Include(i => i.Metadata)
                    .Include(i => i.Bitstreams)
                    .Where(i => i.Id != Item.Id 
                                && i.Name.Contains(Item.Name) // e.g. "Furia (Brillante Gallop)" contains "Furia"
                                && i.Metadata.Any(m => m.Field == "dc.creator" && m.Value == creatorMeta.Value)) 
                    .ToListAsync();
                
                // 3. Add their audio/video bitstreams to our list
                foreach (var related in relatedItems)
                {
                    var mediaFiles = related.Bitstreams
                        .Where(b => (b.MimeType != null && (b.MimeType.StartsWith("audio/") || b.MimeType.StartsWith("video/")))
                                 || (b.Name != null && (b.Name.EndsWith(".mp3") || b.Name.EndsWith(".wav") || b.Name.EndsWith(".mp4") || b.Name.EndsWith(".m4v"))))
                        .ToList();
                        
                    if (mediaFiles.Any())
                    {
                        Item.Bitstreams.AddRange(mediaFiles);
                    }
                }
            }
            // --- AUTO-LINKING LOGIC END ---

            // Find best cover image using shared logic
            CoverImage = Trumpet_Web.Services.ImageHelper.GetBestCoverImage(Item);

            return Page();
        }
    }
}
