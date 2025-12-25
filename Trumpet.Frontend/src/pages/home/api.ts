import { API_BASE_URL } from "../../api/config";
import type { Item } from "../../models/domain";

export async function fetchItems(
  path?: string,
  search?: string,
  communityId?: string,
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

  console.log("[fetchItems] Requesting URL:", url);
  
  const response = await fetch(url);
  console.log("[fetchItems] Response status:", response.status);
  
  if (!response.ok) {
    console.error("[fetchItems] Request failed:", response.statusText);
    throw new Error("Failed to fetch items");
  }
  
  const data = await response.json();
  console.log("[fetchItems] Response data:", data);
  return data;
}

export async function fetchCommunityItems(communityId: string): Promise<Item[]> {
  const url = `${API_BASE_URL}/api/CommunityItems/${communityId}`;
  console.log("[fetchCommunityItems] Requesting URL:", url);
  
  const response = await fetch(url);
  console.log("[fetchCommunityItems] Response status:", response.status);
  
  if (!response.ok) {
    console.error("[fetchCommunityItems] Request failed:", response.statusText);
    throw new Error("Failed to fetch community items");
  }
  
  const data = await response.json();
  console.log("[fetchCommunityItems] Response data:", data);
  return data;
}

