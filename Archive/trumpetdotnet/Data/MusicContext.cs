using Microsoft.EntityFrameworkCore;
using Trumpet.Backend.Models;

namespace Trumpet.Backend.Data;

public class MusicContext : DbContext
{
    public DbSet<Community> Communities { get; set; }
    public DbSet<Collection> Collections { get; set; }
    public DbSet<Item> Items { get; set; }
    public DbSet<MetadataValue> MetadataValues { get; set; }
    public DbSet<Bitstream> Bitstreams { get; set; }

    public MusicContext(DbContextOptions<MusicContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Relationships are configured via [ForeignKey] attributes on the models.
        // Do NOT re-configure them here — doing so causes EF to create duplicate
        // shadow FK columns (e.g. ParentCommunityId1) which breaks all queries.
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        // Configuration is handled via Dependency Injection in Program.cs
    }
}
