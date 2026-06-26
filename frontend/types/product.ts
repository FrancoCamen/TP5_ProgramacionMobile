import type {
  StrapiCollectionRelation,
  StrapiMediaRelation,
  StrapiSingleMediaRelation,
  StrapiRelation,
} from '@/types/api';

export interface CategoryAttributes {
  name: string;
  slug: string;
  icon?: StrapiSingleMediaRelation;
  products?: StrapiCollectionRelation<ProductAttributes>;
}

export interface BrandAttributes {
  name: string;
  logo?: StrapiSingleMediaRelation;
  products?: StrapiCollectionRelation<ProductAttributes>;
}

export type ProductSpecs = Record<string, string | number | boolean | null>;

export interface ProductAttributes {
  name: string;
  description: string;
  price: number;
  discount: number | null;
  stock: number;
  specs: ProductSpecs | null;
  isActive: boolean;
  images?: StrapiMediaRelation;
  category?: StrapiRelation<CategoryAttributes>;
  brand?: StrapiRelation<BrandAttributes>;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discount: number | null;
  stock: number;
  specs: ProductSpecs | null;
  isActive: boolean;
  images: string[];
  category: {
    id: number;
    name: string;
    slug: string;
  } | null;
  brand: {
    id: number;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  categorySlug?: string;
  brandName?: string;
  maxPrice?: number;
  sort?: 'price:asc' | 'price:desc' | 'name:asc' | 'createdAt:desc';
  page?: number;
  pageSize?: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  iconUrl: string | null;
  productCount: number;
}

export interface Brand {
  id: number;
  name: string;
  logoUrl: string | null;
  productCount: number;
}
