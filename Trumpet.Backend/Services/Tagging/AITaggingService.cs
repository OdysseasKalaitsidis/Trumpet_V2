using Microsoft.EntityFrameworkCore;
using Trumpet.Backend.Data;
using Trumpet.Backend.Models;
using System.Text.RegularExpressions;

namespace Trumpet.Backend.Services.Tagging;

public class AITaggingService : ITaggingService
{
    private readonly MusicContext _context;
    private readonly ILogger<AITaggingService> _logger;

    public AITaggingService(MusicContext context, ILogger<AITaggingService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<string>> GenerateTagsAsync(Item item)
    {
        // 1. Check Predefined Tags (User Knowledge Base)
        var normalizedName = item.Name.ToLower().Trim();
        foreach (var entry in _predefinedTags)
        {
            if (normalizedName.Contains(entry.Key))
            {
                return entry.Value.ToList();
            }
        }

        // 2. Fallback to Heuristic Simulated AI
        var sb = new System.Text.StringBuilder(item.Name);
        
        // Aggregate all useful metadata for context
        var usefulFields = new[] { "dc.description", "dc.subject", "dc.contributor", "dc.type", "dc.title" };
        
        foreach (var meta in item.Metadata)
        {
             if (usefulFields.Any(f => meta.Field.StartsWith(f)))
             {
                 sb.Append(" ").Append(meta.Value);
             }
        }

        return await SimulatedAIAnalysis(sb.ToString());
    }

    private readonly Dictionary<string, string[]> _predefinedTags = new()
    {
        { "metodo per lo studio del pianoforte", new[] { "Piano", "Pedagogy", "Instructional" } },
        { "marche hongroise", new[] { "Classical", "Orchestral", "Piano Solo" } },
        { "spanische tanze", new[] { "Dance", "Spanish", "Romantic" } },
        { "libro iii, mazurke per pianoforte op.6", new[] { "Chopin", "Mazurka", "Piano" } },
        { "menuet aus mozart's sinfonie in es", new[] { "Mozart", "Symphony", "Arrangement" } },
        { "etude iii", new[] { "Study", "Technique", "Piano" } },
        { "danse de la frayeur", new[] { "de Falla", "Modern", "Spanish" } },
        { "preghiera del mose", new[] { "Rossini", "Opera", "Sacred" } },
        { "iris serenata di jor", new[] { "Mascagni", "Opera", "Serenade" } },
        { "la gioconda", new[] { "Ponchielli", "Opera", "Vocal Score" } },
        { "herodiade", new[] { "Massenet", "French Opera", "Biblical" } },
        { "il barbiere di siviglia", new[] { "Rossini", "Opera Buffa", "Italian" } },
        { "chant hindou", new[] { "Rimsky-Korsakov", "Opera", "Sadko" } },
        { "vorrei morire!...", new[] { "Tosti", "Romanza", "Vocal" } },
        { "rigoletto", new[] { "Verdi", "Opera", "Drama" } },
        { "tosca", new[] { "Puccini", "Opera", "Verismo" } },
        { "mefistofele", new[] { "Boito", "Opera", "Faust" } },
        { "rondo capriccioso", new[] { "Mendelssohn", "Virtuoso", "Piano" } },
        { "danze spagnuole per pianoforte, op.12", new[] { "Moszkowski", "Dance", "Piano" } },
        { "caprice espagnol", new[] { "Rimsky-Korsakov", "Orchestral", "Spanish" } },
        { "nocturnes", new[] { "Chopin", "Romantic", "Piano" } },
        { "humoresques de concert menuet pour piano", new[] { "Paderewski", "Piano Solo", "Concert" } },
        { "fedora", new[] { "Giordano", "Opera", "Verismo" } },
        { "czardas", new[] { "Monti", "Hungarian", "Violin/Piano" } },
        { "die lustige witwe", new[] { "Lehár", "Operetta", "Viennese" } },
        { "serenade / σερενάδα", new[] { "Vocal", "Romantic", "Melodic" } },
        { "cavalerie legere", new[] { "von Suppé", "Overture", "Operetta" } },
        { "le tango de nos amours", new[] { "Tango", "Dance", "Popular" } },
        { "26 melodies", new[] { "Vocal", "Collection", "Art Song" } },
        { "der zigeunerprimas", new[] { "Kálmán", "Operetta", "Gypsy Style" } },
        { "egmont", new[] { "Beethoven", "Incidental Music", "Overture" } },
        { "ο γέρο δήμος", new[] { "Karreras", "Greek Song", "Folklore" } },
        { "lakme", new[] { "Delibes", "French Opera", "Exoticism" } },
        { "cavalleria rusticana", new[] { "Mascagni", "Verismo", "Opera" } },
        { "mignon", new[] { "Thomas", "Opéra Comique", "French" } },
        { "cavatine de leïla", new[] { "Bizet", "The Pearl Fishers", "Soprano" } },
        { "mireille", new[] { "Gounod", "Opera", "Provençal" } },
        { "romeo et juliette", new[] { "Gounod", "Shakespeare", "Opera" } },
        { "i puritani", new[] { "Bellini", "Bel Canto", "Opera" } },
        { "la sonnambula", new[] { "Bellini", "Bel Canto", "Opera" } },
        { "die csárdásfürstin", new[] { "Kálmán", "Operetta", "Hungarian" } },
        { "aida", new[] { "Verdi", "Grand Opera", "Egypt" } },
        { "ouverture de guillaume tell", new[] { "Rossini", "Overture", "Final" } },
        { "pagliacci", new[] { "Leoncavallo", "Verismo", "Opera" } },
        { "μέθυσες μια καρδιά", new[] { "Greek", "Popular", "Vocal" } },
        { "souvenir des aples", new[] { "Flute/Piano", "Romantic", "Alpine" } },
        { "madame butterfly", new[] { "Puccini", "Opera", "Japan" } },
        { "invitation a la valse", new[] { "Weber", "Waltz", "Piano" } },
        { "manon", new[] { "Massenet", "French Opera", "Drama" } },
        { "mattinata", new[] { "Leoncavallo", "Song", "Italian" } },
        { "chanson de solveig", new[] { "Grieg", "Peer Gynt", "Vocal" } },
        { "tannhauser", new[] { "Wagner", "German Opera", "Romantic" } }
    };

    private async Task<List<string>> SimulatedAIAnalysis(string text)
    {
        // This simulates the AI analyzing the text and picking 3 relevant topics.
        // We look for known keywords in the domain (Music, History, formats, etc.)
        
        var potentialTags = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var lowerText = text.ToLower();

        // 1. Broad Categories
        if (lowerText.Contains("music") || lowerText.Contains("song")) potentialTags.Add("Music");
        if (lowerText.Contains("band") || lowerText.Contains("orchestra")) potentialTags.Add("Ensemble");
        if (lowerText.Contains("interview") || lowerText.Contains("oral info")) potentialTags.Add("Oral History");
        if (lowerText.Contains("score") || lowerText.Contains("sheet") || lowerText.Contains("notation")) potentialTags.Add("Sheet Music");
        if (lowerText.Contains("recording") || lowerText.Contains("tape")) potentialTags.Add("Audio Recording");
        if (lowerText.Contains("corfu") || lowerText.Contains("kerkyra")) potentialTags.Add("Corfu Heritage");
        if (lowerText.Contains("χορωδία") || lowerText.Contains("choir")) potentialTags.Add("Choral");
        if (lowerText.Contains("πιάνο") || lowerText.Contains("πιάνου")) potentialTags.Add("Piano");
        if (lowerText.Contains("βιολί")) potentialTags.Add("Violin");

        // 2. Specific Genres/Types (Heuristic)
        if (lowerText.Contains("jazz")) potentialTags.Add("Jazz");
        if (lowerText.Contains("classical") || lowerText.Contains("symphony")) potentialTags.Add("Classical");
        if (lowerText.Contains("church") || lowerText.Contains("sacred") || lowerText.Contains("chant")) potentialTags.Add("Sacred Music");
        if (lowerText.Contains("folk") || lowerText.Contains("traditional")) potentialTags.Add("Folk");
        
        // 3. Instruments
        if (lowerText.Contains("piano")) potentialTags.Add("Piano");
        if (lowerText.Contains("violin")) potentialTags.Add("Violin");
        if (lowerText.Contains("trumpet") || lowerText.Contains("brass")) potentialTags.Add("Brass");
        if (lowerText.Contains("choir") || lowerText.Contains("choral")) potentialTags.Add("Choral");

        // Fallback if no tags found
        if (potentialTags.Count == 0)
        {
            potentialTags.Add("Uncategorized");
            potentialTags.Add("Archive Item");
        }

        // Return top 3 unique tags
        return potentialTags.Take(3).ToList();
    }

    public async Task BackfillTagsAsync()
    {
        var items = await _context.Items
            .Include(i => i.Metadata)
            .ToListAsync();

        int count = 0;
        foreach (var item in items)
        {
            // Remove existing tags to ensure we update with the latest verified tags
            var existingTags = item.Metadata.Where(m => m.Field == "trumpet.tag").ToList();
            if (existingTags.Any())
            {
                _context.MetadataValues.RemoveRange(existingTags);
            }

            var tags = await GenerateTagsAsync(item);
            
            foreach (var tag in tags)
            {
                _context.MetadataValues.Add(new MetadataValue
                {
                    ItemId = item.Id,
                    Field = "trumpet.tag",
                    Value = tag,
                    Language = "en"
                });
            }
            count++;
        }

        if (count > 0)
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Backfilled tags for {count} items.");
        }
    }
}
