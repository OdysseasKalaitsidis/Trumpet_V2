using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Trumpet.Net.Models;

public class Collection
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Handle { get; set; } = "";
    public string? IntroductoryText { get; set; }
    public string? ParentCommunityId { get; set; }
    public List<Item> Items { get; set; } = new();
}
