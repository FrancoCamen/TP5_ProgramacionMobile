import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';
import type { Product } from '@/types/product';
import { calculateDiscountedPrice } from '@/utils/calculateDiscount';
import { formatPrice } from '@/utils/formatPrice';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const finalPrice = calculateDiscountedPrice(
    product.price,
    product.discount
  );
  const hasDiscount = finalPrice < product.price;
  const imageUrl = product.images[0];

  return (
    <Link
      href={{ pathname: '/product/[id]', params: { id: String(product.id) } }}
      asChild>
      <Pressable style={styles.card}>
        <View style={styles.imageWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.imageFallback}>
              <Ionicons
                name="hardware-chip-outline"
                color={Colors.textMuted}
                size={34}
              />
            </View>
          )}
          {product.discount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[product.brand?.name, product.category?.name]
              .filter(Boolean)
              .join(' · ') || 'Producto destacado'}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(finalPrice)}</Text>
            {hasDiscount ? (
              <Text style={styles.oldPrice}>{formatPrice(product.price)}</Text>
            ) : null}
          </View>
          <Text
            style={[
              styles.stock,
              product.stock <= 0 ? styles.stockOut : null,
            ]}>
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  imageWrap: {
    position: 'relative',
    aspectRatio: 1.25,
    backgroundColor: '#EDEDED',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 999,
    backgroundColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  body: {
    padding: 12,
    gap: 7,
  },
  name: {
    minHeight: 42,
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  meta: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 8,
  },
  price: {
    color: Colors.primaryDark,
    fontSize: 17,
    fontWeight: '900',
  },
  oldPrice: {
    color: Colors.textMuted,
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  stock: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  stockOut: {
    color: Colors.danger,
  },
});
