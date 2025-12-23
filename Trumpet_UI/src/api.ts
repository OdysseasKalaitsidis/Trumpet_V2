import type { Item } from './types';

export const API_BASE_URL = 'http://localhost:5268';

export async function fetchItems(path?: string, search?: string, page: number = 1, pageSize: number = 1000): Promise<Item[]> {
    let url = `${API_BASE_URL}/api/items?page=${page}&pageSize=${pageSize}`;
    if (path) {
        url += `&path=${path}`;
    }
    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch items');
    }
    return response.json();
}

export async function fetchItem(id: string): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/api/items/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch item');
    }
    return response.json();
}

export function getMediaUrl(filePath: string): string {
    // Convert local file path to URL
    // e.g. ...\out\path\to\file -> /media/path/to/file
    // Backend serves static files from its middleware (we might need to add one if not present)
    // Actually, backend has `[WEB] Serving media from: .../out` so it probably serves it statically?
    // Wait, Trumpet_Web was serving it. Trumpet_Net is just an API. 
    // We need to make sure Trumpet_Net (or a new static file server) serves the media files.
    // For now, let's assume we will configure Trumpet_Net to serve static files from /media path mapping to the 'out' folder.

    // Logic from Razor:
    // int outIndex = coverImage.LocalFilePath.IndexOf("out" + System.IO.Path.DirectorySeparatorChar);
    // imageUrl = "/media/" + coverImage.LocalFilePath.Substring(outIndex + 4).Replace("\\", "/");

    const outMarker = 'out';
    const idx = filePath.indexOf(outMarker);
    if (idx !== -1) {
        // +3 for 'out' + 1 for separator (assuming standard path)
        // We might need to be careful with separators.
        // Let's trying splitting by 'out/' or 'out\'
        const part = filePath.substring(idx + 3); // skips 'out'
        // remove leading separator if present
        const cleanPart = part.replace(/^[/\\]/, '').replace(/\\/g, '/');
        const encodedPart = cleanPart.split('/').map(encodeURIComponent).join('/');
        return `${API_BASE_URL}/media/${encodedPart}`;
    }
    return '';
}
