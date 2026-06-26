import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { getApiErrorMessage } from '@/services/api';
import { orderService } from '@/services/orderService';
import type { Order, OrderStatus } from '@/types/order';
import { formatPrice } from '@/utils/formatPrice';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  shipped: 'Enviada',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
};

export default function OrdersScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setOrders(await orderService.getAll());
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, 'No se pudo cargar el historial')
      );
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthLoading) {
      void loadOrders();
    }
  }, [isAuthLoading, loadOrders]);

  if (isAuthLoading || isLoading) {
    return (
      <ScreenScaffold title="Órdenes">
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Cargando historial...</Text>
        </View>
      </ScreenScaffold>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenScaffold
        title="Órdenes"
        description="Iniciá sesión para consultar tus compras simuladas.">
        <View style={styles.centerState}>
          <Ionicons name="lock-closed-outline" color={Colors.textMuted} size={34} />
          <Text style={styles.stateText}>
            El historial está asociado a tu usuario.
          </Text>
          <Link
            href={{ pathname: '/login', params: { returnTo: '/orders' } }}
            asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
            </Pressable>
          </Link>
        </View>
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold
      title="Órdenes"
      description="Historial de órdenes creadas desde el checkout simulado.">
      {error ? (
        <View style={styles.centerState}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.primaryButton} onPress={loadOrders}>
            <Text style={styles.primaryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="receipt-outline" color={Colors.textMuted} size={34} />
          <Text style={styles.stateText}>Todavía no tenés órdenes.</Text>
          <Link href="/" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Explorar catálogo</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <View style={styles.list}>
          {orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderTitle}>Orden #{order.id}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('es-AR')}
                  </Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {statusLabels[order.status]}
                  </Text>
                </View>
              </View>

              <View style={styles.items}>
                {order.items.map((item) => (
                  <View key={`${order.id}-${item.productId}`} style={styles.itemRow}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.quantity} x {item.name}
                    </Text>
                    <Text style={styles.itemSubtotal}>
                      {formatPrice(item.subtotal)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScreenScaffold>
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
  list: {
    gap: 12,
  },
  orderCard: {
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    padding: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  orderDate: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  statusBadge: {
    borderRadius: 999,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  items: {
    gap: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  itemName: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  itemSubtotal: {
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
    fontSize: 16,
    fontWeight: '900',
  },
  totalValue: {
    color: Colors.primaryDark,
    fontSize: 18,
    fontWeight: '900',
  },
  error: {
    color: Colors.danger,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
