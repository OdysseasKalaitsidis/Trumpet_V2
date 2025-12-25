import { API_BASE_URL } from '../../api/config';
import { Community } from './models';

/**
 * Fetch all communities, optionally filtered by path
 */
export async function fetchCommunities(path?: string): Promise<Community[]> {
  const url = path 
    ? `${API_BASE_URL}/api/communities?path=${path}`
    : `${API_BASE_URL}/api/communities`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch communities: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get human-readable path title
 */
export function getPathTitle(pathKey: string | null): string {
  switch (pathKey) {
    case 'ArtMusic': return 'Art Music';
    case 'UrbanPopular': return 'Urban Popular Music';
    case 'RuralMusic': return 'Rural Music';
    case 'SacredMusic': return 'Sacred Music';
    default: return 'All Communities';
  }
}
