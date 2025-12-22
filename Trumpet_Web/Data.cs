using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Trumpet.Net.Models
{
    // The same structure as your Importer
    public class MusicContext : DbContext
    {
    public DbSet<Item> Items { get; set; }
    public DbSet<MetadataValue> MetadataValues { get; set; }
    public DbSet<Bitstream> Bitstreams { get; set; }

    // IMPORTANT: Points to the database file in the sibling folder 'Trumpet_Net'
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite("Data Source=../Trumpet_Net/corfiot_music.db");

    public DbSet<Community> Communities { get; set; }
    public DbSet<Collection> Collections { get; set; }
}

public class Item
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string CollectionId { get; set; } = "";
    public List<MetadataValue> Metadata { get; set; } = new();
    public List<Bitstream> Bitstreams { get; set; } = new();
}

public class MetadataValue
{
    public int Id { get; set; }
    public string ItemId { get; set; } = "";
    public string Field { get; set; } = "";
    public string? Value { get; set; }
    public string? Language { get; set; }
}

public class Bitstream
{
    public string Id { get; set; } = "";
    public string ItemId { get; set; } = "";
    public string Name { get; set; } = "";
    public string? MimeType { get; set; }
    public string LocalFilePath { get; set; } = "";
}

public class Community
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Handle { get; set; } = "";
    public string? IntroductoryText { get; set; }
    public string? ParentCommunityId { get; set; }
}

public class Collection
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Handle { get; set; } = "";
    public string? IntroductoryText { get; set; }
    public string? ParentCommunityId { get; set; }
    // Navigation property if needed, but simple ID matching might suffice for read-only
    }
}