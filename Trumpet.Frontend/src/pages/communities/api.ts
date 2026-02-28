import { API_BASE_URL } from '../../api/config';
import { Community } from './models';
import type { Language } from '../../hooks/useLanguage';
import { tr } from '../../i18n/translations';

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
 * Get human-readable, localised path title
 */
export function getPathTitle(pathKey: string | null, language: Language = 'en'): string {
  switch (pathKey) {
    case 'ArtMusic': return tr(language, 'communities.pathTitle.artMusic');
    case 'UrbanPopular': return tr(language, 'communities.pathTitle.urbanPopular');
    case 'RuralMusic': return tr(language, 'communities.pathTitle.ruralMusic');
    case 'SacredMusic': return tr(language, 'communities.pathTitle.sacredMusic');
    default: return tr(language, 'communities.pathTitle.all');
  }
}
