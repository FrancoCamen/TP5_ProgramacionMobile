import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScreenScaffold } from '@/components/ScreenScaffold';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { getApiErrorMessage } from '@/services/api';
import { productService } from '@/services/productService';
import type { Product } from '@/types/product';
import { calculateDiscountedPrice } from '@/utils/calculateDiscount';
import { formatPrice } from '@/utils/formatPrice';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriteSubmitting, setIsFavoriteSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!Number.isFinite(productId)) {
      setError('El producto solicitado no es válido');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const loadedProduct = await productService.getById(productId);
      setProduct(loadedProduct);
      setSelectedImage(0);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, 'No se pudo cargar el producto')
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const specs = useMemo(
    () => (product?.specs ? Object.entries(product.specs) : []),
    [product?.specs]
  );

  const finalPrice = product
    ? calculateDiscountedPrice(product.price, product.discount)
    : 0;
  const productIsFavorite = product ? isFavorite(product.id) : false;

  async function handleFavoritePress() {
    if (!product) {
      return;
    }

    setIsFavoriteSubmitting(true);
    setFavoriteError(null);

    try {
      if (productIsFavorite) {
        await removeFavorite(product.id);
      } else {
        await addFavorite(product.id);
      }
    } catch (requestError) {
      setFavoriteError(
        getApiErrorMessage(requestError, 'No se pudo actualizar favoritos')
      );
    } finally {
      setIsFavoriteSubmitting(false);
    }
  }

  function handleAddToCart() {
    if (!product) {
      return;
    }

    setCartMessage(null);

    try {
      addItem(product);
      setCartMessage('Producto agregado al carrito');
    } catch (addError) {
      setCartMessage(
        addError instanceof Error
          ? addError.message
          : 'No se pudo agregar al carrito'
      );
    }
  }

  return (
    <ScreenScaffold
      title={product?.name ?? `Producto #${id}`}
      description={
        product
          ? [product.brand?.name, product.category?.name].filter(Boolean).join(' · ')
          : 'Detalle del producto'
      }>
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Cargando producto...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadProduct}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : product ? (
        <>
          <View style={styles.gallery}>
            <View style={styles.heroImage}>
              {product.images[selectedImage] ? (
                <Image
                  source={{ uri: product.images[selectedImage] }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.imageFallback}>
                  <Ionicons
                    name="hardware-chip-outline"
                    color={Colors.textMuted}
                    size={48}
                  />
                </View>
              )}
              {product.discount ? (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{product.discount}%</Text>
                </View>
              ) : null}
            </View>
            {product.images.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailRow}>
                {product.images.map((image, index) => (
                  <Pressable
                    key={image}
                    style={[
                      styles.thumbnail,
                      selectedImage === index ? styles.thumbnailActive : null,
                    ]}
                    onPress={() => setSelectedImage(index)}>
                    <Image source={{ uri: image }} style={styles.thumbnailImage} />
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
          </View>

          <View style={styles.infoPanel}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(finalPrice)}</Text>
              {finalPrice < product.price ? (
                <Text style={styles.oldPrice}>{formatPrice(product.price)}</Text>
              ) : null}
            </View>
            <Text
              style={[
                styles.stock,
                product.stock <= 0 ? styles.stockOut : null,
              ]}>
              {product.stock > 0
                ? `${product.stock} unidades disponibles`
                : 'Sin stock disponible'}
            </Text>
            <Pressable
              style={[
                styles.cartButton,
                product.stock <= 0 ? styles.disabled : null,
              ]}
              disabled={product.stock <= 0}
              onPress={handleAddToCart}>
              <Ionicons name="cart-outline" color="#FFFFFF" size={20} />
              <Text style={styles.cartButtonText}>Agregar al carrito</Text>
            </Pressable>
            {cartMessage ? (
              <Text
                style={[
                  styles.inlineMessage,
                  cartMessage.includes('agregado')
                    ? styles.inlineSuccess
                    : styles.inlineError,
                ]}>
                {cartMessage}
              </Text>
            ) : null}
            {isAuthenticated ? (
              <Pressable
                style={[
                  styles.favoriteButton,
                  productIsFavorite ? styles.favoriteButtonActive : null,
                  isFavoriteSubmitting ? styles.disabled : null,
                ]}
                disabled={isFavoriteSubmitting}
                onPress={handleFavoritePress}>
                {isFavoriteSubmitting ? (
                  <ActivityIndicator
                    color={productIsFavorite ? '#FFFFFF' : Colors.primary}
                  />
                ) : (
                  <>
                    <Ionicons
                      name={productIsFavorite ? 'heart' : 'heart-outline'}
                      color={productIsFavorite ? '#FFFFFF' : Colors.primary}
                      size={20}
                    />
                    <Text
                      style={[
                        styles.favoriteButtonText,
                        productIsFavorite ? styles.favoriteButtonTextActive : null,
                      ]}>
                      {productIsFavorite
                        ? 'Guardado en favoritos'
                        : 'Guardar en favoritos'}
                    </Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Link
                href={{ pathname: '/login', params: { returnTo: `/product/${id}` } }}
                asChild>
                <Pressable style={styles.loginPrompt}>
                  <Ionicons
                    name="lock-closed-outline"
                    color={Colors.primary}
                    size={18}
                  />
                  <Text style={styles.loginPromptText}>
                    Iniciá sesión para guardar este producto
                  </Text>
                </Pressable>
              </Link>
            )}
            {favoriteError ? (
              <Text style={styles.error}>{favoriteError}</Text>
            ) : null}
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {specs.length > 0 ? (
            <View style={styles.infoPanel}>
              <Text style={styles.sectionTitle}>Especificaciones</Text>
              {specs.map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{String(value ?? '-')}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  gallery: {
    gap: 10,
  },
  heroImage: {
    position: 'relative',
    overflow: 'hidden',
    aspectRatio: 1.15,
    borderRadius: 8,
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
    top: 14,
    left: 14,
    borderRadius: 999,
    backgroundColor: Colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  thumbnailRow: {
    gap: 8,
    paddingRight: 20,
  },
  thumbnail: {
    width: 70,
    height: 70,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  thumbnailActive: {
    borderColor: Colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  infoPanel: {
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 10,
  },
  price: {
    color: Colors.primaryDark,
    fontSize: 28,
    fontWeight: '900',
  },
  oldPrice: {
    color: Colors.textMuted,
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  stock: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '800',
  },
  stockOut: {
    color: Colors.danger,
  },
  cartButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  inlineMessage: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  inlineSuccess: {
    color: Colors.success,
  },
  inlineError: {
    color: Colors.danger,
  },
  favoriteButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
  },
  favoriteButtonActive: {
    backgroundColor: Colors.primary,
  },
  favoriteButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
  favoriteButtonTextActive: {
    color: '#FFFFFF',
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
  disabled: {
    opacity: 0.65,
  },
  description: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 23,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  specKey: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  specValue: {
    flex: 1,
    color: Colors.text,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '800',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
    gap: 10,
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
  error: {
    color: Colors.danger,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
