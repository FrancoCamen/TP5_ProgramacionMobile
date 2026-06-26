import type { StrapiRelation } from '@/types/api';
import type { Product, ProductAttributes } from '@/types/product';

export interface FavoriteAttributes {
  product: StrapiRelation<ProductAttributes>;
  createdAt: string;
  updatedAt: string;
}

export interface Favorite {
  id: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}
