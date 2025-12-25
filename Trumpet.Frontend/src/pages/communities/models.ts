/**
 * Community DTOs and Models
 */

export interface Community {
  id: string;
  name: string;
  introductoryText: string;
}

export interface CommunitiesResponse {
  communities: Community[];
  total: number;
}
