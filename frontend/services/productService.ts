import { api } from '@/services/api';
import { mapProduct } from '@/services/mappers';
import type {
  StrapiListResponse,
  StrapiSingleResponse,
} from '@/types/api';
import type {
  Product,
  ProductAttributes,
  ProductFilters,
} from '@/types/product';

export interface ProductPage {
  products: Product[];
  pagination: StrapiListResponse<ProductAttributes>['meta']['pagination'];
}

function buildProductParams(filters: ProductFilters) {
  return {
    populate: 'images,category,brand',
    'filters[name][$containsi]': filters.search,
    'filters[category][slug][$eq]': filters.categorySlug,
    'filters[brand][name][$eq]': filters.brandName,
    'filters[price][$lte]': filters.maxPrice,
    sort: filters.sort ?? 'createdAt:desc',
    'pagination[page]': filters.page ?? 1,
    'pagination[pageSize]': filters.pageSize ?? 10,
  };
}

export const productService = {
  async getAll(filters: ProductFilters = {}): Promise<ProductPage> {
    const { data } = await api.get<StrapiListResponse<ProductAttributes>>(
      '/products',
      { params: buildProductParams(filters) }
    );

    return {
      products: data.data.map(mapProduct),
      pagination: data.meta.pagination,
    };
  },

  async getById(id: number): Promise<Product> {
    const { data } = await api.get<StrapiSingleResponse<ProductAttributes>>(
      `/products/${id}`,
      { params: { populate: 'images,category,brand' } }
    );

    return mapProduct(data.data);
  },
};
