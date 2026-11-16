export interface AdminCategoryImage {
  id: number;
  original_url: string;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  nameZh?: string | null;
  sortOrder: number;
  category_image: AdminCategoryImage | null;
  status: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminCategoryPage {
  content: AdminCategory[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UpsertCategoryBody {
  name: string;
  slug?: string;
  nameZh?: string | null;
  sortOrder?: number;
  active: boolean;
}
