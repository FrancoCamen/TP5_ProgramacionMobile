export interface StrapiEntity<T> {
  id: number;
  attributes: T;
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiListResponse<T> {
  data: StrapiEntity<T>[];
  meta: {
    pagination: Pagination;
  };
}

export interface StrapiSingleResponse<T> {
  data: StrapiEntity<T>;
  meta: Record<string, unknown>;
}

export interface StrapiRelation<T> {
  data: StrapiEntity<T> | null;
}

export interface StrapiCollectionRelation<T> {
  data: StrapiEntity<T>[] | null;
}

export interface StrapiMediaAttributes {
  name: string;
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface StrapiMediaRelation {
  data: StrapiEntity<StrapiMediaAttributes>[] | null;
}

export interface StrapiSingleMediaRelation {
  data: StrapiEntity<StrapiMediaAttributes> | null;
}

export interface ApiErrorPayload {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details?: unknown;
  };
}
