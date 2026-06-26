import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { ScreenScaffold } from '@/components/ScreenScaffold';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';

export default function FavoritesScreen() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { favorites, isLoading, removeFavorite, refresh } = useFavorites();

  if (isAuthLoading) {
    return (
      <ScreenScaffold title="Favoritos">
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Restaurando sesión...</Text>
        </View>
      </ScreenScaffold>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenScaffold
        title="Favoritos"
        description="Iniciá sesión para guardar productos y consultarlos después.">
        <View style={styles.centerState}>
          <Ionicons name="lock-closed-outline" color={Colors.textMuted} size={34} />
          <Text style={styles.stateText}>
            Esta sección requiere una sesión activa.
          </Text>
          <Link
            href={{ pathname: '/login', params: { returnTo: '/favorites' } }}
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
      title="Favoritos"
      description="Tus productos guardados se sincronizan con Strapi.">
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Cargando favoritos...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="heart-outline" color={Colors.textMuted} size={34} />
          <Text style={styles.stateText}>Todavía no guardaste productos.</Text>
          <Link href="/" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Explorar catálogo</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.count}>{favorites.length} guardados</Text>
            <Pressable style={styles.refreshButton} onPress={refresh}>
              <Ionicons name="refresh" color={Colors.primary} size={18} />
              <Text style={styles.refreshText}>Actualizar</Text>
            </Pressable>
          </View>
          <View style={styles.list}>
            {favorites.map((favorite) => (
              <View key={favorite.id} style={styles.favoriteItem}>
                <ProductCard product={favorite.product} />
                <Pressable
                  style={styles.removeButton}
                  onPress={() => void removeFavorite(favorite.product.id)}>
                  <Ionicons name="trash-outline" color={Colors.danger} size={18} />
                  <Text style={styles.removeText}>Quitar de favoritos</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      )}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 210,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  count: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  refreshButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
  },
  refreshText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  list: {
    gap: 14,
  },
  favoriteItem: {
    gap: 8,
  },
  removeButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  removeText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '900',
  },
});
