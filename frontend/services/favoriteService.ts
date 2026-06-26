import { api } from '@/services/api';
import { mapFavorite } from '@/services/mappers';
import type { StrapiListResponse, StrapiSingleResponse } from '@/types/api';
import type { Favorite, FavoriteAttributes } from '@/types/favorite';

export const favoriteService = {
  async getAll(): Promise<Favorite[]> {
    const { data } =
      await api.get<StrapiListResponse<FavoriteAttributes>>('/favorites');

    return data.data
      .map(mapFavorite)
      .filter((favorite): favorite is Favorite => favorite !== null);
  },

  async add(productId: number): Promise<Favorite> {
    const { data } = await api.post<
      StrapiSingleResponse<FavoriteAttributes>
    >('/favorites', {
      data: { product: productId },
    });
    const favorite = mapFavorite(data.data);

    if (!favorite) {
      throw new Error('El favorito no contiene un producto válido');
    }

    return favorite;
  },

  async remove(favoriteId: number): Promise<void> {
    await api.delete(`/favorites/${favoriteId}`);
  },
};
