namespace Trumpet.Net.Models;

public class Bitstream
{
    public string Id { get; set; } = "";
    public string ItemId { get; set; } = "";
    public string Name { get; set; } = "";
    public string? MimeType { get; set; }
    public long SizeBytes { get; set; }
    public string LocalFilePath { get; set; } = "";
}
