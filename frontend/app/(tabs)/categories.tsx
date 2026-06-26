import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScreenScaffold } from '@/components/ScreenScaffold';
import { Colors } from '@/constants/colors';
import { getApiErrorMessage } from '@/services/api';
import { categoryService } from '@/services/categoryService';
import type { Category } from '@/types/product';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCategories() {
    setIsLoading(true);
    setError(null);

    try {
      setCategories(await categoryService.getAll());
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, 'No se pudieron cargar las categorías')
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  return (
    <ScreenScaffold
      title="Categorías"
      description="Elegí una familia de productos para filtrar el catálogo.">
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Cargando categorías...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadCategories}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="grid-outline" color={Colors.textMuted} size={32} />
          <Text style={styles.stateText}>Todavía no hay categorías cargadas.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={styles.categoryCard}
              onPress={() =>
                router.push({
                  pathname: '/',
                  params: { category: category.slug },
                })
              }>
              <View style={styles.iconWrap}>
                {category.iconUrl ? (
                  <Image
                    source={{ uri: category.iconUrl }}
                    style={styles.iconImage}
                  />
                ) : (
                  <Ionicons
                    name="hardware-chip-outline"
                    color={Colors.primary}
                    size={30}
                  />
                )}
              </View>
              <View style={styles.categoryText}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>
                  {category.productCount} productos
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                color={Colors.textMuted}
                size={20}
              />
            </Pressable>
          ))}
        </View>
      )}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  categoryCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    padding: 14,
  },
  iconWrap: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  categoryText: {
    flex: 1,
    gap: 4,
  },
  categoryName: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  categoryCount: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
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
