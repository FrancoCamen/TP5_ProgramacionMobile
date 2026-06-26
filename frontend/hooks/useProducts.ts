import { useCallback, useEffect, useState } from 'react';

import { getApiErrorMessage } from '@/services/api';
import { productService } from '@/services/productService';
import type { Pagination } from '@/types/api';
import type { Product, ProductFilters } from '@/types/product';

export function useProducts(filters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await productService.getAll(filters);
      setProducts(result.products);
      setPagination(result.pagination);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, 'No se pudieron cargar los productos')
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.brandName,
    filters.categorySlug,
    filters.maxPrice,
    filters.page,
    filters.pageSize,
    filters.search,
    filters.sort,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  return { products, pagination, isLoading, error, refresh: load };
}
