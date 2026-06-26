import axios, { AxiosError } from 'axios';

import { API_URL, REQUEST_TIMEOUT_MS } from '@/constants/config';
import { tokenStorage } from '@/storage/tokenStorage';
import type { ApiErrorPayload } from '@/types/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado'
): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.error?.message ?? error.message ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export function isUnauthorizedError(error: unknown): boolean {
  return (
    error instanceof AxiosError &&
    (error.response?.status === 401 || error.response?.status === 403)
  );
}
