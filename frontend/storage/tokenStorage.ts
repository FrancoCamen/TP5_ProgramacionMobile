import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'tp5.auth.token';

export const tokenStorage = {
  async get(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(TOKEN_KEY);
    }

    return SecureStore.getItemAsync(TOKEN_KEY);
  },

  async set(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  async remove(): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(TOKEN_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
