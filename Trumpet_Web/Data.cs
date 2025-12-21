using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

// The same structure as your Importer
public class MusicContext : DbContext
{
    public DbSet<Item> Items { get; set; }
    public DbSet<MetadataValue> MetadataValues { get; set; }
    public DbSet<Bitstream> Bitstreams { get; set; }

    // IMPORTANT: Points to the database file in the sibling folder 'Trumpet_Net'
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite("Data Source=../Trumpet_Net/corfiot_music.db");
}

public class Item
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public List<MetadataValue> Metadata { get; set; } = new();
    public List<Bitstream> Bitstreams { get; set; } = new();
}

public class MetadataValue
{
    public int Id { get; set; }
    public string ItemId { get; set; } = "";
    public string Field { get; set; } = "";
    public string? Value { get; set; }
}

public class Bitstream
{
    public string Id { get; set; } = "";
    public string ItemId { get; set; } = "";
    public string Name { get; set; } = "";
    public string? MimeType { get; set; }
    public string LocalFilePath { get; set; } = "";
}