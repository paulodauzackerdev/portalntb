import { apiGet } from "./api.server";

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
}

export async function getPublicCategories(): Promise<PublicCategory[]> {
  try {
    const res = await apiGet<PublicCategory[]>("/categories", { active: "true" });
    return res.data || [];
  } catch {
    return [];
  }
}
