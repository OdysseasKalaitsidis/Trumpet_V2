using Trumpet.Backend.Models;

namespace Trumpet.Backend.Services.Tagging;

public interface ITaggingService
{
    Task<List<string>> GenerateTagsAsync(Item item);
    Task BackfillTagsAsync();
}
