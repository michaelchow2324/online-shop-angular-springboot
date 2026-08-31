export interface AdminProductImage {
  id: number;
  original_url: string;
  mime_type?: string;
  primary: boolean;
}

export interface AdminProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  price: number;
  product_thumbnail: { id?: number; original_url: string } | null;
  status: boolean;
  images: AdminProductImage[];
  categories: AdminProductCategory[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminProductPage {
  content: AdminProduct[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface CatalogImportResult {
  created: number;
  updated: number;
  imagesUploaded: number;
  errors: string[];
}

export interface UpsertProductBody {
  name: string;
  slug?: string;
  sku?: string | null;
  description?: string | null;
  price: number;
  active: boolean;
  categoryIds: number[];
}
