import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { useAuth } from '@/hooks/useAuth';
import { favoriteService } from '@/services/favoriteService';
import type { Favorite } from '@/types/favorite';

export interface FavoritesContextValue {
  favorites: Favorite[];
  isLoading: boolean;
  isFavorite: (productId: number) => boolean;
  addFavorite: (productId: number) => Promise<void>;
  removeFavorite: (productId: number) => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
}

export const FavoritesContext = createContext<
  FavoritesContextValue | undefined
>(undefined);

export function FavoritesProvider({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clear = useCallback(() => {
    setFavorites([]);
  }, []);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      clear();
      return;
    }

    setIsLoading(true);

    try {
      setFavorites(await favoriteService.getAll());
    } finally {
      setIsLoading(false);
    }
  }, [clear, isAuthenticated]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const isFavorite = useCallback(
    (productId: number) =>
      favorites.some((favorite) => favorite.product.id === productId),
    [favorites]
  );

  const addFavorite = useCallback(
    async (productId: number) => {
      if (!isAuthenticated) {
        throw new Error('Debes iniciar sesión para guardar favoritos');
      }

      if (isFavorite(productId)) {
        return;
      }

      const favorite = await favoriteService.add(productId);
      setFavorites((current) => [...current, favorite]);
    },
    [isAuthenticated, isFavorite]
  );

  const removeFavorite = useCallback(
    async (productId: number) => {
      const favorite = favorites.find(
        (item) => item.product.id === productId
      );

      if (!favorite) {
        return;
      }

      await favoriteService.remove(favorite.id);
      setFavorites((current) =>
        current.filter((item) => item.id !== favorite.id)
      );
    },
    [favorites]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      isLoading,
      isFavorite,
      addFavorite,
      removeFavorite,
      refresh,
      clear,
    }),
    [
      addFavorite,
      clear,
      favorites,
      isFavorite,
      isLoading,
      refresh,
      removeFavorite,
    ]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
