import type { Item, MetadataValue } from '../models/domain';
import type { Language } from '../hooks/useLanguage';

/**
 * Get the best metadata value for a field, respecting the selected language.
 * Priority: selected language → English → any value
 */
export function getLocalizedMetadata(metadata: MetadataValue[], field: string, lang: Language): string {
       const all = metadata.filter(m => m.field === field);
       if (all.length === 0) return '';

       // 1. Selected language
       const byLang = all.filter(m => m.language?.startsWith(lang) || m.language?.startsWith(lang.split('-')[0]));
       if (byLang.length > 0) return byLang.map(m => m.value).join(', ');

       // 2. English fallback
       if (lang !== 'en') {
              const byEn = all.filter(m => m.language?.startsWith('en'));
              if (byEn.length > 0) return byEn.map(m => m.value).join(', ');
       }

       // 3. Any value (no language specified or other)
       return all.map(m => m.value).join(', ');
}

/**
 * Get the localized title for an item.
 * Uses dc.title.parallel[lang] if available, otherwise falls back to item.name (dc.title in English).
 */
export function getLocalizedTitle(item: Item, lang: Language): string {
       if (lang === 'en') return item.name;

       // Try dc.title.parallel for the selected language
       const parallel = item.metadata.filter(
              m => m.field === 'dc.title.parallel' && m.language?.startsWith(lang)
       );
       if (parallel.length > 0) return parallel[0].value;

       // Fallback to main dc.title (stored as item.name)
       return item.name;
}

/**
 * Get the localized description for an item.
 */
export function getLocalizedDescription(item: Item, lang: Language): string {
       return getLocalizedMetadata(item.metadata, 'dc.description', lang);
}

/**
 * Get the localized contributor/author for an item.
 * Checks dc.contributor.author, dc.creator, dc.contributor.other in order.
 */
export function getLocalizedContributor(item: Item, lang: Language): string {
       const fields = ['dc.contributor.author', 'dc.creator', 'dc.contributor.other'];
       const all = item.metadata.filter(m => fields.includes(m.field));

       // 1. Selected language
       const byLang = all.filter(m => m.language?.startsWith(lang));
       if (byLang.length > 0) return Array.from(new Set(byLang.map(m => m.value))).join('; ');

       // 2. English fallback
       if (lang !== 'en') {
              const byEn = all.filter(m => m.language?.startsWith('en'));
              if (byEn.length > 0) return Array.from(new Set(byEn.map(m => m.value))).join('; ');
       }

       // 3. Any
       return Array.from(new Set(all.map(m => m.value))).join('; ');
}
