import { useState, useEffect } from "react";
import type { Item } from "../models/domain";
import { fetchItem } from "../pages/item-detail/api";

export function useItem(id: string | undefined) {
       const [item, setItem] = useState<Item | null>(null);
       const [loading, setLoading] = useState(false);
       const [error, setError] = useState<Error | null>(null);

       useEffect(() => {
              if (!id) return;

              const load = async () => {
                     setLoading(true);
                     setError(null);
                     try {
                            const data = await fetchItem(id);
                            setItem(data);
                     } catch (err) {
                            setError(err instanceof Error ? err : new Error("Failed to fetch item"));
                     } finally {
                            setLoading(false);
                     }
              };

              load();
       }, [id]);

       return { item, loading, error };
}
