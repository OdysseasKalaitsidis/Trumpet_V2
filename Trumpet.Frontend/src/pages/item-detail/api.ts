import { API_BASE_URL } from "../../api/config";
import type { Item } from "../../models/domain";

export async function fetchItem(id: string): Promise<Item> {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch item");
  }
  return response.json();
}

export const fetchRecommendations = async (itemId: string): Promise<Item[]> => {
  const response = await fetch(`${API_BASE_URL}/api/items/${itemId}/recommendations`);
  return await response.json();
};
