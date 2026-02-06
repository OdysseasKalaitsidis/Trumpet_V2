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
      try {
        let data: Item[];
        // Prioritize collectionId if present, even within a community context
        if (collectionId) {
          data = await fetchItems(undefined, searchQuery, undefined, collectionId);
        } else if (communityId) {
          data = await fetchCommunityItems(communityId);
        } else {
          data = await fetchItems(pathFilter, searchQuery);
        }
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch items"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pathFilter, searchQuery, communityId, collectionId]);

  return { items, loading, error };
}
