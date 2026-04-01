using Trumpet.Backend.Models;

namespace Trumpet.Backend.Services.Recommendations;

public interface IRecommendationService
{
    Task<List<Item>> GetRecommendationsAsync(string itemId, int maxResults = 5);
}
