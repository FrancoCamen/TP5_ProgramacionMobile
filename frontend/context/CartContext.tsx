import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { cartStorage } from '@/storage/cartStorage';
import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/product';
import { calculateDiscountedPrice } from '@/utils/calculateDiscount';

export interface CartContextValue {
  items: CartItem[];
  isLoading: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

export const CartContext = createContext<CartContextValue | undefined>(
  undefined
);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    cartStorage
      .get()
      .then((storedItems) => {
        if (isMounted) {
          setItems(storedItems);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      void cartStorage.set(items);
    }
  }, [isLoading, items]);

  const addItem = useCallback((product: Product) => {
    if (product.stock <= 0) {
      throw new Error('El producto no tiene stock disponible');
    }

    setItems((currentItems) => {
      const existing = currentItems.find(
        (item) => item.product.id === product.id
      );

      if (!existing) {
        return [...currentItems, { product, quantity: 1 }];
      }

      if (existing.quantity >= product.stock) {
        throw new Error('No hay más unidades disponibles');
      }

      return currentItems.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) => {
          if (item.product.id !== productId) {
            return item;
          }

          if (quantity > item.product.stock) {
            throw new Error('La cantidad supera el stock disponible');
          }

          return { ...item, quantity };
        })
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    void cartStorage.clear();
  }, []);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          calculateDiscountedPrice(
            item.product.price,
            item.product.discount
          ) *
            item.quantity,
        0
      ),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isLoading,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      total,
      itemCount,
    }),
    [
      addItem,
      clearCart,
      isLoading,
      itemCount,
      items,
      removeItem,
      total,
      updateQuantity,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
