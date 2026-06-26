import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ProductCard } from '@/components/ProductCard';
import { ScreenScaffold } from '@/components/ScreenScaffold';
import { Colors } from '@/constants/colors';
import { getApiErrorMessage } from '@/services/api';
import { brandService } from '@/services/brandService';
import { categoryService } from '@/services/categoryService';
import { useProducts } from '@/hooks/useProducts';
import type { Brand, Category, ProductFilters } from '@/types/product';

const PAGE_SIZE = 8;
const sortOptions: {
  label: string;
  value: NonNullable<ProductFilters['sort']>;
}[] = [
  { label: 'Recientes', value: 'createdAt:desc' },
  { label: 'Menor precio', value: 'price:asc' },
  { label: 'Mayor precio', value: 'price:desc' },
  { label: 'Nombre', value: 'name:asc' },
];

export default function CatalogScreen() {
  const params = useLocalSearchParams<{
    category?: string;
    brand?: string;
  }>();
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedBrand, setSelectedBrand] = useState<string>();
  const [sort, setSort] =
    useState<NonNullable<ProductFilters['sort']>>('createdAt:desc');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filtersError, setFiltersError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof params.category === 'string') {
      setSelectedCategory(params.category);
      setPage(1);
    }

    if (typeof params.brand === 'string') {
      setSelectedBrand(params.brand);
      setPage(1);
    }
  }, [params.brand, params.category]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([categoryService.getAll(), brandService.getAll()])
      .then(([loadedCategories, loadedBrands]) => {
        if (isMounted) {
          setCategories(loadedCategories);
          setBrands(loadedBrands);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setFiltersError(
            getApiErrorMessage(error, 'No se pudieron cargar los filtros')
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filters = useMemo<ProductFilters>(
    () => ({
      search: search || undefined,
      categorySlug: selectedCategory,
      brandName: selectedBrand,
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    [page, search, selectedBrand, selectedCategory, sort]
  );

  const { products, pagination, isLoading, error, refresh } =
    useProducts(filters);

  function applySearch() {
    setSearch(searchText.trim());
    setPage(1);
  }

  function clearFilters() {
    setSearchText('');
    setSearch('');
    setSelectedCategory(undefined);
    setSelectedBrand(undefined);
    setSort('createdAt:desc');
    setPage(1);
  }

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(selectedCategory) ||
    Boolean(selectedBrand) ||
    sort !== 'createdAt:desc';

  return (
    <ScreenScaffold
      title="Catálogo"
      description="Explorá productos, combiná filtros y abrí el detalle para ver especificaciones.">
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" color={Colors.textMuted} size={20} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={applySearch}
            placeholder="Buscar notebooks, monitores, accesorios..."
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
        <Pressable style={styles.iconButton} onPress={applySearch}>
          <Ionicons name="arrow-forward" color="#FFFFFF" size={20} />
        </Pressable>
      </View>

      {filtersError ? <Text style={styles.error}>{filtersError}</Text> : null}

      <FilterSection title="Categorías">
        <FilterChip
          label="Todas"
          active={!selectedCategory}
          onPress={() => {
            setSelectedCategory(undefined);
            setPage(1);
          }}
        />
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            label={category.name}
            active={selectedCategory === category.slug}
            onPress={() => {
              setSelectedCategory(category.slug);
              setPage(1);
            }}
          />
        ))}
      </FilterSection>

      <FilterSection title="Marcas">
        <FilterChip
          label="Todas"
          active={!selectedBrand}
          onPress={() => {
            setSelectedBrand(undefined);
            setPage(1);
          }}
        />
        {brands.map((brand) => (
          <FilterChip
            key={brand.id}
            label={brand.name}
            active={selectedBrand === brand.name}
            onPress={() => {
              setSelectedBrand(brand.name);
              setPage(1);
            }}
          />
        ))}
      </FilterSection>

      <FilterSection title="Orden">
        {sortOptions.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            active={sort === option.value}
            onPress={() => {
              setSort(option.value);
              setPage(1);
            }}
          />
        ))}
      </FilterSection>

      {hasActiveFilters ? (
        <Pressable style={styles.clearButton} onPress={clearFilters}>
          <Ionicons name="close-circle-outline" color={Colors.primary} size={18} />
          <Text style={styles.clearButtonText}>Limpiar filtros</Text>
        </Pressable>
      ) : null}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Productos</Text>
        {pagination ? (
          <Text style={styles.resultsCount}>{pagination.total} resultados</Text>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Cargando productos...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.secondaryButton} onPress={refresh}>
            <Text style={styles.secondaryButtonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="cube-outline" color={Colors.textMuted} size={32} />
          <Text style={styles.stateText}>No hay productos para esos filtros.</Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {products.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard product={product} />
            </View>
          ))}
        </View>
      )}

      {pagination && pagination.pageCount > 1 ? (
        <View style={styles.pagination}>
          <Pressable
            style={[
              styles.pageButton,
              page <= 1 ? styles.pageButtonDisabled : null,
            ]}
            disabled={page <= 1}
            onPress={() => setPage((current) => Math.max(1, current - 1))}>
            <Ionicons name="chevron-back" color={Colors.text} size={18} />
            <Text style={styles.pageButtonText}>Anterior</Text>
          </Pressable>
          <Text style={styles.pageText}>
            {pagination.page} / {pagination.pageCount}
          </Text>
          <Pressable
            style={[
              styles.pageButton,
              page >= pagination.pageCount ? styles.pageButtonDisabled : null,
            ]}
            disabled={page >= pagination.pageCount}
            onPress={() =>
              setPage((current) =>
                pagination ? Math.min(pagination.pageCount, current + 1) : current
              )
            }>
            <Text style={styles.pageButtonText}>Siguiente</Text>
            <Ionicons name="chevron-forward" color={Colors.text} size={18} />
          </Pressable>
        </View>
      ) : null}
    </ScreenScaffold>
  );
}

interface FilterSectionProps {
  title: string;
  children: ReactNode;
}

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}>
        {children}
      </ScrollView>
    </View>
  );
}

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function FilterChip({ label, active, onPress }: FilterChipProps) {
  return (
    <Pressable
      style={[styles.chip, active ? styles.chipActive : null]}
      onPress={onPress}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  filterSection: {
    gap: 8,
  },
  filterTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  chipRow: {
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    minHeight: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: '#E5E5E5',
  },
  chipText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  chipTextActive: {
    color: Colors.primaryDark,
  },
  clearButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultsTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  resultsCount: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    rowGap: 12,
  },
  gridItem: {
    width: '50%',
    paddingHorizontal: 6,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
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
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryButton: {
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  pageButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
  },
  pageButtonDisabled: {
    opacity: 0.45,
  },
  pageButtonText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  pageText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
});
