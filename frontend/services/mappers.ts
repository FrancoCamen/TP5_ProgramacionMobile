import { API_URL } from '@/constants/config';
import type { StrapiEntity } from '@/types/api';
import type { Favorite, FavoriteAttributes } from '@/types/favorite';
import type { Order, OrderAttributes } from '@/types/order';
import type {
  Brand,
  BrandAttributes,
  Category,
  CategoryAttributes,
  Product,
  ProductAttributes,
} from '@/types/product';

const serverUrl = API_URL.replace(/\/api$/, '');

function getMediaUrl(url: string): string {
  return url.startsWith('http') ? url : `${serverUrl}${url}`;
}

export function mapProduct(
  entity: StrapiEntity<ProductAttributes>
): Product {
  const { attributes } = entity;
  const category = attributes.category?.data;
  const brand = attributes.brand?.data;

  return {
    id: entity.id,
    name: attributes.name,
    description: attributes.description,
    price: Number(attributes.price),
    discount:
      attributes.discount === null ? null : Number(attributes.discount),
    stock: attributes.stock,
    specs: attributes.specs,
    isActive: attributes.isActive,
    images:
      attributes.images?.data?.map((image) =>
        getMediaUrl(image.attributes.url)
      ) ?? [],
    category: category
      ? {
          id: category.id,
          name: category.attributes.name,
          slug: category.attributes.slug,
        }
      : null,
    brand: brand
      ? {
          id: brand.id,
          name: brand.attributes.name,
        }
      : null,
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
  };
}

export function mapCategory(
  entity: StrapiEntity<CategoryAttributes>
): Category {
  const { attributes } = entity;

  return {
    id: entity.id,
    name: attributes.name,
    slug: attributes.slug,
    iconUrl: attributes.icon?.data
      ? getMediaUrl(attributes.icon.data.attributes.url)
      : null,
    productCount: attributes.products?.data?.length ?? 0,
  };
}

export function mapBrand(entity: StrapiEntity<BrandAttributes>): Brand {
  const { attributes } = entity;

  return {
    id: entity.id,
    name: attributes.name,
    logoUrl: attributes.logo?.data
      ? getMediaUrl(attributes.logo.data.attributes.url)
      : null,
    productCount: attributes.products?.data?.length ?? 0,
  };
}

export function mapFavorite(
  entity: StrapiEntity<FavoriteAttributes>
): Favorite | null {
  const product = entity.attributes.product.data;

  if (!product) {
    return null;
  }

  return {
    id: entity.id,
    product: mapProduct(product),
    createdAt: entity.attributes.createdAt,
    updatedAt: entity.attributes.updatedAt,
  };
}

export function mapOrder(entity: StrapiEntity<OrderAttributes>): Order {
  return {
    id: entity.id,
    items: entity.attributes.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    })),
    total: Number(entity.attributes.total),
    status: entity.attributes.status,
    createdAt: entity.attributes.createdAt,
    updatedAt: entity.attributes.updatedAt,
  };
}
