using Microsoft.EntityFrameworkCore;

namespace Trumpet.Shared;

public class MusicContext : DbContext
{
    public DbSet<Community> Communities { get; set; }
    public DbSet<Collection> Collections { get; set; }
    public DbSet<Item> Items { get; set; }
    public DbSet<MetadataValue> MetadataValues { get; set; }
    public DbSet<Bitstream> Bitstreams { get; set; }

    public MusicContext(DbContextOptions<MusicContext> options) : base(options) { }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        if (!options.IsConfigured)
        {
            // Ideally this connection string should come from configuration, 
            // but preserving the relative path logic for now as per original code.
            // Note: Relative paths in context of a library might be tricky depending on execution directory.
            options.UseSqlite("Data Source=corfiot_music.db"); 
        }
    }
}
