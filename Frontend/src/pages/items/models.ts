/**
 * Item DTOs and Models for Items Browser
 */

export interface ItemMetadata {
  field: string;
  value: string;
}

export interface Item {
  id: string;
  name: string;
  metadata: ItemMetadata[];
}

export interface ItemsResponse {
  items: Item[];
  total: number;
}
