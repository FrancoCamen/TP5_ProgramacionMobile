import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScreenScaffold } from '@/components/ScreenScaffold';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { getApiErrorMessage } from '@/services/api';
import { orderService } from '@/services/orderService';
import { calculateDiscountedPrice } from '@/utils/calculateDiscount';
import { formatPrice } from '@/utils/formatPrice';

const ordersHref = '/orders' as Href;

export default function CartScreen() {
  const {
    items,
    itemCount,
    total,
    isLoading,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [items]
  );
  const savings = Math.max(0, subtotal - total);

  function safelyUpdateQuantity(productId: number, quantity: number) {
    setError(null);

    try {
      updateQuantity(productId, quantity);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'No se pudo actualizar la cantidad'
      );
    }
  }

  async function handleCheckout() {
    if (!isAuthenticated) {
      setError('Iniciá sesión para finalizar la compra');
      return;
    }

    if (items.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    setIsCheckingOut(true);
    setError(null);
    setMessage(null);

    try {
      const order = await orderService.create(
        items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }))
      );
      clearCart();
      setMessage(`Orden #${order.id} creada por ${formatPrice(order.total)}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo crear la orden'));
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <ScreenScaffold
      title="Carrito"
      description="Revisá cantidades, descuentos y confirmá una orden simulada.">
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Restaurando carrito...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="cart-outline" color={Colors.textMuted} size={38} />
          <Text style={styles.stateText}>
            El carrito está vacío. Agregá productos desde el catálogo.
          </Text>
          <Link href="/" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Explorar catálogo</Text>
            </Pressable>
          </Link>
          <Link href={ordersHref} asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Ver órdenes</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <>
          <View style={styles.list}>
            {items.map((item) => {
              const finalPrice = calculateDiscountedPrice(
                item.product.price,
                item.product.discount
              );
              const imageUrl = item.product.images[0];

              return (
                <View key={item.product.id} style={styles.cartItem}>
                  <View style={styles.itemTop}>
                    <View style={styles.imageWrap}>
                      {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                      ) : (
                        <Ionicons
                          name="hardware-chip-outline"
                          color={Colors.textMuted}
                          size={26}
                        />
                      )}
                    </View>
                    <View style={styles.itemText}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.product.name}
                      </Text>
                      <Text style={styles.itemMeta}>
                        {formatPrice(finalPrice)} por unidad
                      </Text>
                      <Text style={styles.itemSubtotal}>
                        {formatPrice(finalPrice * item.quantity)}
                      </Text>
                    </View>
                    <Pressable
                      style={styles.trashButton}
                      onPress={() => removeItem(item.product.id)}>
                      <Ionicons
                        name="trash-outline"
                        color={Colors.danger}
                        size={20}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.quantityRow}>
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() =>
                        safelyUpdateQuantity(
                          item.product.id,
                          item.quantity - 1
                        )
                      }>
                      <Ionicons name="remove" color={Colors.text} size={18} />
                    </Pressable>
                    <Text style={styles.quantity}>{item.quantity}</Text>
                    <Pressable
                      style={[
                        styles.quantityButton,
                        item.quantity >= item.product.stock
                          ? styles.disabled
                          : null,
                      ]}
                      disabled={item.quantity >= item.product.stock}
                      onPress={() =>
                        safelyUpdateQuantity(
                          item.product.id,
                          item.quantity + 1
                        )
                      }>
                      <Ionicons name="add" color={Colors.text} size={18} />
                    </Pressable>
                    <Text style={styles.stockText}>
                      Stock: {item.product.stock}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.summary}>
            <SummaryRow label="Unidades" value={String(itemCount)} />
            <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
            <SummaryRow label="Descuentos" value={`-${formatPrice(savings)}`} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {message ? <Text style={styles.success}>{message}</Text> : null}

          {!isAuthLoading && !isAuthenticated ? (
            <Link
              href={{ pathname: '/login', params: { returnTo: '/cart' } }}
              asChild>
              <Pressable style={styles.loginPrompt}>
                <Ionicons
                  name="lock-closed-outline"
                  color={Colors.primary}
                  size={18}
                />
                <Text style={styles.loginPromptText}>
                  Iniciá sesión para finalizar la compra
                </Text>
              </Pressable>
            </Link>
          ) : null}

          <Pressable
            style={[
              styles.checkoutButton,
              isCheckingOut || !isAuthenticated ? styles.disabled : null,
            ]}
            disabled={isCheckingOut || !isAuthenticated}
            onPress={handleCheckout}>
            {isCheckingOut ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.checkoutButtonText}>Crear orden</Text>
            )}
          </Pressable>

          <View style={styles.footerActions}>
            <Pressable style={styles.secondaryButton} onPress={clearCart}>
              <Text style={styles.secondaryButtonText}>Vaciar carrito</Text>
            </Pressable>
            <Link href={ordersHref} asChild>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Historial</Text>
              </Pressable>
            </Link>
          </View>
        </>
      )}
    </ScreenScaffold>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    padding: 20,
  },
  stateText: {
    color: Colors.textMuted,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  cartItem: {
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    padding: 12,
  },
  itemTop: {
    flexDirection: 'row',
    gap: 12,
  },
  imageWrap: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#EDEDED',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemText: {
    flex: 1,
    gap: 5,
  },
  itemName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 21,
  },
  itemMeta: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  itemSubtotal: {
    color: Colors.primaryDark,
    fontSize: 16,
    fontWeight: '900',
  },
  trashButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F2F2F2',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  quantity: {
    minWidth: 26,
    color: Colors.text,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
  },
  stockText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  summary: {
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  summaryLabel: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  summaryValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  totalLabel: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  totalValue: {
    color: Colors.primaryDark,
    fontSize: 20,
    fontWeight: '900',
  },
  checkoutButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  primaryButton: {
    minHeight: 42,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  loginPrompt: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
  },
  loginPromptText: {
    color: Colors.primary,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '900',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  disabled: {
    opacity: 0.55,
  },
  error: {
    color: Colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  success: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
});
