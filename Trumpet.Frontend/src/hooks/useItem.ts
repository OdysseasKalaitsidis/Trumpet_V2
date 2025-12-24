import { useState, useEffect } from "react";
import type { Item } from "../models/domain";
import { fetchItem } from "../pages/item-detail/api";

export function useItem(id: string | undefined) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetchItem(id)
      .then(setItem)
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Failed to fetch item"));
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { item, loading, error };
}
