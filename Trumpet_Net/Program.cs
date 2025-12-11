using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

// ==========================================
// PART 1: Database Context & Models
// ==========================================

public class MusicContext : DbContext
{
    public DbSet<Community> Communities { get; set; }
    public DbSet<Collection> Collections { get; set; }
    public DbSet<Item> Items { get; set; }
    public DbSet<MetadataValue> MetadataValues { get; set; }
    public DbSet<Bitstream> Bitstreams { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite("Data Source=corfiot_music.db");
}

public class Community
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Handle { get; set; } = "";
    public string? IntroductoryText { get; set; }
    public string? ParentCommunityId { get; set; }
    public List<Collection> Collections { get; set; } = new();
}

public class Collection
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Handle { get; set; } = "";
    public string? IntroductoryText { get; set; }
    public string? ParentCommunityId { get; set; }
    public List<Item> Items { get; set; } = new();
}

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
    public long SizeBytes { get; set; }
    public string LocalFilePath { get; set; } = "";
}

// ==========================================
// PART 2: Main Logic (Disk-First & Robust JSON)
// ==========================================

class Program
{
    static void Main(string[] args)
    {
        // 1. Initialize Database
        using var db = new MusicContext();
        db.Database.EnsureDeleted();
        db.Database.EnsureCreated();
        Console.WriteLine("Database created successfully.");

        string baseDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../.."));
        
        string GetString(JToken token, string key) => token[key]?.ToString() ?? "";
        string GetId(JToken token) => token["uuid"]?.ToString() ?? token["id"]?.ToString() ?? Guid.NewGuid().ToString();

        // ---------------------------------------------------------
        // 2. Import Communities (From Metadata File)
        // ---------------------------------------------------------
        Console.WriteLine("Importing Communities...");
        string commPath = Path.Combine(baseDir, "communities_20251022_132429.json");
        if (File.Exists(commPath))
        {
            var communitiesData = JArray.Parse(File.ReadAllText(commPath));
            var existingIds = new HashSet<string>();

            foreach (var c in communitiesData)
            {
                string id = GetId(c);
                if (existingIds.Contains(id)) continue;

                var comm = new Community
                {
                    Id = id,
                    Name = GetString(c, "name"),
                    Handle = GetString(c, "handle"),
                    IntroductoryText = GetString(c, "introductoryText"),
                    ParentCommunityId = c["parentCommunity"] != null && c["parentCommunity"].Type != JTokenType.Null 
                        ? (c["parentCommunity"]["id"]?.ToString() ?? c["parentCommunity"]["uuid"]?.ToString())
                        : null
                };
                db.Communities.Add(comm);
                existingIds.Add(id);
            }
            db.SaveChanges();
        }

        // ---------------------------------------------------------
        // 3. Import Collections (From Metadata File)
        // ---------------------------------------------------------
        Console.WriteLine("Importing Collections...");
        string collPath = Path.Combine(baseDir, "collections_20251022_132519.json");
        if (File.Exists(collPath))
        {
            var collectionsData = JArray.Parse(File.ReadAllText(collPath));
            foreach (var col in collectionsData)
            {
                string? parentId = null;
                if (col["parentCommunity"] != null && col["parentCommunity"].Type != JTokenType.Null)
                    parentId = col["parentCommunity"]["id"]?.ToString() ?? col["parentCommunity"]["uuid"]?.ToString();
                
                if (parentId == null && col["parentCommunityList"] != null)
                {
                    var firstParent = col["parentCommunityList"].FirstOrDefault();
                    if (firstParent != null) parentId = firstParent["id"]?.ToString() ?? firstParent["uuid"]?.ToString();
                }

                var collection = new Collection
                {
                    Id = GetId(col),
                    Name = GetString(col, "name"),
                    Handle = GetString(col, "handle"),
                    IntroductoryText = GetString(col, "introductoryText"),
                    ParentCommunityId = parentId 
                };
                db.Collections.Add(collection);
            }
            db.SaveChanges();
        }

        // ---------------------------------------------------------
        // 4. Import Items (SCANNING DISK)
        // ---------------------------------------------------------
        Console.WriteLine("Scanning disk for Items...");
        string itemsRoot = Path.Combine(baseDir, "out", "collections");

        if (!Directory.Exists(itemsRoot))
        {
            Console.WriteLine($"[ERROR] Could not find folder: {itemsRoot}");
            return;
        }

        var allJsonFiles = Directory.GetFiles(itemsRoot, "item_expanded.json", SearchOption.AllDirectories);
        Console.WriteLine($"Found {allJsonFiles.Length} items on disk. Importing now...");

        int counter = 0;
        int bitstreamsFound = 0;

        foreach (var jsonFile in allJsonFiles)
        {
            try 
            {
                var expanded = JObject.Parse(File.ReadAllText(jsonFile));
                string itemId = GetId(expanded);
                
                // Get Collection ID from path
                var itemDir = Directory.GetParent(jsonFile);         
                var itemsContainer = Directory.GetParent(itemDir.FullName); 
                var collectionDir = Directory.GetParent(itemsContainer.FullName); 
                string collectionId = collectionDir.Name;

                var newItem = new Item
                {
                    Id = itemId,
                    Name = GetString(expanded, "name"),
                    Handle = GetString(expanded, "handle"),
                    Withdrawn = expanded["withdrawn"]?.ToString().ToLower() == "true",
                    Archived = expanded["archived"]?.ToString().ToLower() == "true",
                    CollectionId = collectionId
                };
                db.Items.Add(newItem);

                // --- ROBUST METADATA PARSING START ---
                // We check if "metadata" is an Array (List) or Object (Dictionary) to avoid the crash
                if (expanded["metadata"] is JArray metaArray)
                {
                    // Case 1: Metadata is a List [ { "key": "dc.title", "value": "..." }, ... ]
                    foreach (var meta in metaArray)
                    {
                        string key = meta["key"]?.ToString();
                        string val = meta["value"]?.ToString();
                        string lang = meta["language"]?.ToString();

                        if (!string.IsNullOrEmpty(key))
                        {
                            db.MetadataValues.Add(new MetadataValue
                            {
                                ItemId = newItem.Id,
                                Field = key,
                                Value = val,
                                Language = lang
                            });
                        }
                    }
                }
                else if (expanded["metadata"] is JObject metaObj)
                {
                    // Case 2: Metadata is a Dictionary { "dc.title": [ { "value": "..." } ] }
                    foreach (var prop in metaObj.Properties())
                    {
                        var key = prop.Name;
                        if (prop.Value is JArray values)
                        {
                            foreach (var valObj in values)
                            {
                                db.MetadataValues.Add(new MetadataValue
                                {
                                    ItemId = newItem.Id,
                                    Field = key,
                                    Value = valObj["value"]?.ToString(),
                                    Language = valObj["language"]?.ToString()
                                });
                            }
                        }
                    }
                }
                // --- ROBUST METADATA PARSING END ---

                // Add Bitstreams
                if (expanded["bitstreams"] != null)
                {
                    foreach (var bit in expanded["bitstreams"])
                    {
                        var bId = GetId(bit);
                        var bName = GetString(bit, "name");
                        string localFile = Path.Combine(itemDir.FullName, "bitstreams", bName);
                        
                        if (File.Exists(localFile))
                        {
                            db.Bitstreams.Add(new Bitstream
                            {
                                Id = bId,
                                ItemId = newItem.Id,
                                Name = bName,
                                MimeType = bit["mimetype"]?.ToString() ?? bit["format"]?.ToString(),
                                SizeBytes = new FileInfo(localFile).Length,
                                LocalFilePath = localFile
                            });
                            bitstreamsFound++;
                        }
                    }
                }

                counter++;
                if (counter % 50 == 0) Console.Write(".");
            }
            catch (Exception ex)
            {
                // Print error but continue to next file
                Console.WriteLine($"\n[Error] Skipping {Path.GetFileName(jsonFile)}: {ex.Message}");
            }
        }
        
        db.SaveChanges();
        Console.WriteLine($"\nDone! Imported {counter} items and {bitstreamsFound} bitstreams.");
    }
}