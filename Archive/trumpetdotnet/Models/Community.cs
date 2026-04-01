using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Trumpet.Backend.Models;

public class Community
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Handle { get; set; } = "";
    public string? IntroductoryText { get; set; }
    public string? ParentCommunityId { get; set; }
    [ForeignKey("ParentCommunityId")]
    public Community? ParentCommunity { get; set; }

    public List<Collection> Collections { get; set; } = new();
    public List<Community> SubCommunities { get; set; } = new();
}
