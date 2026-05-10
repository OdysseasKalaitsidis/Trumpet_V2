export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export function getMediaUrl(filePath: string | undefined | null): string {
  if (!filePath) return "";
  
  // DE-MANGLE: Fix cases where control characters were interpreted during import.
  let cleanedPath = filePath
    .replace(/\x09/g, "/t")      // Tab -> /t (restores \trumpet_data)
    .replace(/\x0D/g, "/r")      // CR -> /r (restores \resources)
    .replace(/\x08/g, "/b")      // BS -> /b (restores \bitstreams)
    .replace(/\x00/g, "/0")       // Null -> /0 (Restores folders starting with 0)
    .replace(/resources/g, "/resources/")
    .replace(/items/g, "/items/")
    .replace(/bitstreams/g, "/bitstreams/")
    .replace(/\\/g, "/")         // Normal backslashes
    .replace(/\/+/g, "/");       // Cleanup double slashes

  const resourcesMarker = "resources";
  const idx = cleanedPath.indexOf(resourcesMarker);
  let cleanPart = "";

  if (idx !== -1) {
    const part = cleanedPath.substring(idx + resourcesMarker.length); 
    cleanPart = part.replace(/^[/\\]/, "");
  } else {
    // If "resources" is not found, assume it might be a direct path
    cleanPart = cleanedPath;
    // If it looks like a full windows path, try to just take the filename as a last resort
    if (cleanPart.includes(":")) {
        cleanPart = cleanPart.split("/").pop() || "";
    }
  }

  if (!cleanPart) return "";
  const encodedPart = cleanPart.split("/").map(encodeURIComponent).join("/");
  return `${API_BASE_URL}/api/media/${encodedPart}`;
}
