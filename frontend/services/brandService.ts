import { api } from '@/services/api';
import { mapBrand } from '@/services/mappers';
import type { StrapiListResponse } from '@/types/api';
import type { Brand, BrandAttributes } from '@/types/product';

export const brandService = {
  async getAll(): Promise<Brand[]> {
    const { data } = await api.get<StrapiListResponse<BrandAttributes>>(
      '/brands',
      {
        params: {
          populate: 'logo,products',
          sort: 'name:asc',
          'pagination[pageSize]': 100,
        },
      }
    );

    return data.data.map(mapBrand);
  },
};
