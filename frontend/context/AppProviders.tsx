import type { PropsWithChildren } from 'react';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { FavoritesProvider } from '@/context/FavoritesContext';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>{children}</FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
