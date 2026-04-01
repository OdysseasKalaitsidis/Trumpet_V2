using Trumpet.Backend.Models;

namespace Trumpet.Backend.Services.Collections;

public interface ICollectionsService
{
    Task<IEnumerable<Collection>> GetCollectionsAsync();
    Task<Collection?> GetCollectionAsync(string id);
    Task<IEnumerable<object>> GetCollectionMappingsAsync();
}
