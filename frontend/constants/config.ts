import { Platform } from 'react-native';

const fallbackApiUrl = Platform.select({
  android: 'http://10.0.2.2:1337/api',
  default: 'http://localhost:1337/api',
});

export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ??
  fallbackApiUrl ??
  'http://localhost:1337/api'
).replace(/\/$/, '');

export const REQUEST_TIMEOUT_MS = 10_000;
