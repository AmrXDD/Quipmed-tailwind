export type UUID = string;

export interface Brand {
  id: UUID;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  website_link: string | null;
  country: string | null;
  sort_order: number;
  created_at: string;
}

export interface Department {
  id: UUID;
  slug: string;
  name: string;
  sort_order: number;
  created_at: string;
}

/** @deprecated — use Department. Left for backwards-compatible imports. */
export type Collection = Department;

export interface Product {
  id: UUID;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  brand_id: UUID | null;
  brand_name: string | null;
  brand?: string | null;
  description: string | null;
  features: string[];
  specs: Record<string, string | number | boolean>;
  image_url: string | null;
  source_url: string | null;
  featured: boolean;
  sort_order: number;
  price?: number | null;
  stock?: number | null;
  is_quotable?: boolean | null;
  department_id: UUID | null;
  /** @deprecated — use department_id */
  collection_id?: UUID | null;
  created_at: string;
}

export interface CompanyInfo {
  key: string;
  value: string;
  updated_at: string;
}

export interface InquiryInput {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
}

export interface Inquiry extends InquiryInput {
  id: UUID;
  status: "new" | "read" | "replied" | "archived";
  source: string;
  created_at: string;
}
