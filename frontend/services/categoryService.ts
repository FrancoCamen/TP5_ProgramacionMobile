import { api } from '@/services/api';
import { mapCategory } from '@/services/mappers';
import type { StrapiListResponse } from '@/types/api';
import type { Category, CategoryAttributes } from '@/types/product';

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get<StrapiListResponse<CategoryAttributes>>(
      '/categories',
      {
        params: {
          populate: 'icon,products',
          sort: 'name:asc',
          'pagination[pageSize]': 100,
        },
      }
    );

    return data.data.map(mapCategory);
  },
};
