using Newtonsoft.Json.Linq;
using Trumpet.Net.Models;
using Trumpet.Net.Data;

namespace Trumpet.Net.Services;

public interface IDataImportService
{
    void ImportData();
}

public class DataImportService : IDataImportService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public DataImportService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public void ImportData()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MusicContext>();

        db.Database.EnsureCreated();
        Console.WriteLine("Database ensured.");

        // Adjust path logic for Web API environment
        // Assuming we are running from bin/Debug/net8.0, we need to go up to the root where 'out' and json files are.
        // Old logic: Path.Combine(AppContext.BaseDirectory, "../../../..")
        // We will try to find the root dynamically or use the same logic if structure is preserved.
        
        // Locate the ImportData folder
        // In Development, we might be in bin/Debug/net8.0. We want to find "ImportData" in the project root.
        // Or if published, it should be relative to AppContext.BaseDirectory.
        
        string baseDir = Path.Combine(AppContext.BaseDirectory.Split("bin")[0], "ImportData");
        if (!Directory.Exists(baseDir))
        {
             // Try adjacent to execution (compiled/published scenario)
             baseDir = Path.Combine(AppContext.BaseDirectory, "ImportData");
        }
        
        if (!Directory.Exists(baseDir))
        {
             Console.WriteLine($"[ERROR] Could not find 'ImportData' directory. Searched at: {baseDir}");
             return; // Cannot proceed
        }
        
        Console.WriteLine($"Using Import Source: {baseDir}");

        string GetString(JToken token, string key) => token[key]?.ToString() ?? "";
        string GetId(JToken token) => token["uuid"]?.ToString() ?? token["id"]?.ToString() ?? Guid.NewGuid().ToString();

        // 1. Communities
        Console.WriteLine("Importing Communities...");
        string commPath = Path.Combine(baseDir, "communities_20251022_132429.json");
        if (File.Exists(commPath))
        {
            var communitiesData = JArray.Parse(File.ReadAllText(commPath));
            var existingIds = new HashSet<string>(db.Communities.Select(c => c.Id).ToList());

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

        // 2. Collections
        Console.WriteLine("Importing Collections...");
        string collPath = Path.Combine(baseDir, "collections_20251022_132519.json");
        if (File.Exists(collPath))
        {
            var collectionsData = JArray.Parse(File.ReadAllText(collPath));
            var existingIds = new HashSet<string>(db.Collections.Select(c => c.Id).ToList());

            foreach (var col in collectionsData)
            {
                string id = GetId(col);
                if (existingIds.Contains(id)) continue;

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
                    Id = id,
                    Name = GetString(col, "name"),
                    Handle = GetString(col, "handle"),
                    IntroductoryText = GetString(col, "introductoryText"),
                    ParentCommunityId = parentId 
                };
                db.Collections.Add(collection);
                existingIds.Add(id);
            }
            db.SaveChanges();
        }

        // 3. Items
        Console.WriteLine("Importing Items...");
        string itemsRoot = Path.Combine(baseDir, "out", "collections");

        if (!Directory.Exists(itemsRoot))
        {
            Console.WriteLine($"[ERROR] Could not find folder: {itemsRoot}");
            return;
        }

        var allJsonFiles = Directory.GetFiles(itemsRoot, "item_expanded.json", SearchOption.AllDirectories);
        int counter = 0;
        
        // Optimize: Check existing items to avoid re-inserting duplicates blindly or causing PK violations
        // For importing 60k items, simple check is slow. Ideally, we assume clean DB or upsert.
        // For now, simpler check.
        var existingItemIds = new HashSet<string>(db.Items.Select(x => x.Id).ToList());

        foreach (var jsonFile in allJsonFiles)
        {
            try 
            {
                var expanded = JObject.Parse(File.ReadAllText(jsonFile));
                string itemId = GetId(expanded);
                
                if (existingItemIds.Contains(itemId)) continue;

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

                // Metadata
                if (expanded["metadata"] is JArray metaArray)
                {
                    foreach (var meta in metaArray)
                    {
                        string key = meta["key"]?.ToString();
                        if (!string.IsNullOrEmpty(key))
                        {
                            db.MetadataValues.Add(new MetadataValue
                            {
                                ItemId = newItem.Id,
                                Field = key,
                                Value = meta["value"]?.ToString(),
                                Language = meta["language"]?.ToString()
                            });
                        }
                    }
                }
                else if (expanded["metadata"] is JObject metaObj)
                {
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

                // Bitstreams
                if (expanded["bitstreams"] != null)
                {
                    foreach (var bit in expanded["bitstreams"])
                    {
                        string bName = GetString(bit, "name");
                        string localFile = Path.Combine(itemDir.FullName, "bitstreams", bName);
                        
                        if (File.Exists(localFile))
                        {
                            db.Bitstreams.Add(new Bitstream
                            {
                                Id = GetId(bit),
                                ItemId = newItem.Id,
                                Name = bName,
                                MimeType = bit["mimetype"]?.ToString() ?? bit["format"]?.ToString(),
                                SizeBytes = new FileInfo(localFile).Length,
                                LocalFilePath = localFile
                            });
                        }
                    }
                }

                counter++;
                if (counter % 100 == 0) // batch save
                {
                    db.SaveChanges();
                    Console.Write(".");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n[Error] Skipping {Path.GetFileName(jsonFile)}: {ex.Message}");
            }
        }
        
        db.SaveChanges();
        Console.WriteLine($"\nImport complete. Imported {counter} new items.");
    }
}
