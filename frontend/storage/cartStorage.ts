import AsyncStorage from '@react-native-async-storage/async-storage';

import type { CartItem } from '@/types/cart';

const CART_KEY = 'tp5.cart.items';

export const cartStorage = {
  async get(): Promise<CartItem[]> {
    const value = await AsyncStorage.getItem(CART_KEY);

    if (!value) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    } catch {
      return [];
    }
  },

  async set(items: CartItem[]): Promise<void> {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(CART_KEY);
  },
};
