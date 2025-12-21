namespace Trumpet.Net.Models;

public class MetadataValue
{
    public int Id { get; set; }
    public string ItemId { get; set; } = "";
    public string Field { get; set; } = "";
    public string? Value { get; set; }
    public string? Language { get; set; }
}
