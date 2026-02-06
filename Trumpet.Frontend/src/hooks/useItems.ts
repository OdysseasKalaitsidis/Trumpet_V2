import { useState, useEffect } from "react";
import type { Item } from "../models/domain";
import { fetchItems, fetchCommunityItems } from "../pages/home/api";

export function useItems(pathFilter: string, searchQuery: string, communityId?: string, collectionId?: string) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      
      console.log("[useItems] Starting fetch with:", { pathFilter, searchQuery, communityId });
      
      try {
        let data: Item[];
        // Prioritize collectionId if present, even within a community context
        if (collectionId) {
          data = await fetchItems(undefined, searchQuery, undefined, collectionId);
        } else if (communityId) {
          data = await fetchCommunityItems(communityId);
          console.log("[useItems] Community items response:", data);
        } else {
          console.log("[useItems] Fetching items with path/search filters");
          data = await fetchItems(pathFilter, searchQuery);
          console.log("[useItems] Items response:", data);
        }
        console.log("[useItems] Total items fetched:", data.length);
        setItems(data);
      } catch (err) {
        console.error("[useItems] Error fetching items:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch items"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pathFilter, searchQuery, communityId, collectionId]);

  return { items, loading, error };
}

