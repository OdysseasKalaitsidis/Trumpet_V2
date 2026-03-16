export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export function getMediaUrl(filePath: string): string {
  const resourcesMarker = "resources";
  const idx = filePath.indexOf(resourcesMarker);
  if (idx !== -1) {
    const part = filePath.substring(idx + resourcesMarker.length); 
    const cleanPart = part.replace(/^[/\\]/, "").replace(/\\/g, "/");
    const encodedPart = cleanPart.split("/").map(encodeURIComponent).join("/");
    return `${API_BASE_URL}/media/${encodedPart}`;
  }
  return "";
}
