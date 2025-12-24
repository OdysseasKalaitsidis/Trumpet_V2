using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Trumpet.Backend.Models;

public class Item
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Handle { get; set; } = "";
    public DateTime? LastModified { get; set; }
    public bool Withdrawn { get; set; }
    public bool Archived { get; set; }
    public string CollectionId { get; set; } = "";
    public List<MetadataValue> Metadata { get; set; } = new();
    public List<Bitstream> Bitstreams { get; set; } = new();
}
