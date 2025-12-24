using Trumpet.Backend.Models;

namespace Trumpet.Backend.Services.Items;

public interface IItemsService
{
    Task<IEnumerable<string>> GetFieldsAsync();
    Task<IEnumerable<string>> GetPathValuesAsync();
    Task<IEnumerable<object>> GetPathCountsAsync();
    Task<IEnumerable<object>> SearchAllMetadataAsync(string value);
    Task<IEnumerable<Item>> GetItemsAsync(string? path, string? search, string? communityId, int page, int pageSize);
    Task<Item?> GetItemAsync(string id);
}
