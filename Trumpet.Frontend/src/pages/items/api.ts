import { API_BASE_URL } from '../../api/config';
import { Item } from './models';

/**
 * Fetch items with optional filters
 */
export async function fetchItems(params: {
  path?: string;
  search?: string;
  communityId?: string;
}): Promise<Item[]> {
  const searchParams = new URLSearchParams();
  
  if (params.path) searchParams.append('path', params.path);
  if (params.search) searchParams.append('search', params.search);
  if (params.communityId) searchParams.append('communityId', params.communityId);
  
  const url = `${API_BASE_URL}/api/items?${searchParams.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get page title based on search context
 */
export function getPageTitle(params: {
  search?: string;
  communityName?: string;
  pathName?: string;
}): string {
  if (params.search) return `Search: "${params.search}"`;
  if (params.communityName) return params.communityName;
  if (params.pathName) return params.pathName;
  return 'Archive Items';
}

/**
 * Get page description based on search context
 */
export function getPageDescription(params: {
  search?: string;
  communityName?: string;
  pathName?: string;
}): string {
  if (params.search) return `Showing results for "${params.search}" in the archive`;
  if (params.communityName) return `Browse the musical archive of ${params.communityName}`;
  return `Explore items in the ${params.pathName || 'Archive'} collection`;
}
