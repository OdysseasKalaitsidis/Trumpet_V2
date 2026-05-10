import { API_BASE_URL } from "../../api/config";
import type { Item } from "../../models/domain";

export async function fetchItems(
  path?: string,
  search?: string,
  communityId?: string,
  collectionId?: string,
  page: number = 1,
  pageSize: number = 1000
): Promise<Item[]> {
  let url = `${API_BASE_URL}/api/items?page=${page}&pageSize=${pageSize}`;
  if (path) {
    url += `&path=${path}`;
  }
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  if (communityId) {
    url += `&communityId=${communityId}`;
  }
  if (collectionId) {
    url += `&collectionId=${collectionId}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    console.error("[fetchItems] Request failed:", response.statusText);
    throw new Error("Failed to fetch items");
  }

  return await response.json();
}

export const fetchPaths = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/api/items/path-values`);
  return await response.json();
};

export async function fetchCommunityItems(communityId: string): Promise<Item[]> {
  const url = `${API_BASE_URL}/api/CommunityItems/${communityId}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error("[fetchCommunityItems] Request failed:", response.statusText);
    throw new Error("Failed to fetch community items");
  }

  return await response.json();
}

