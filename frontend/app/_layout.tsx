import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Colors } from '@/constants/colors';
import { AppProviders } from '@/context/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="product/[id]"
          options={{ title: 'Detalle del producto' }}
        />
        <Stack.Screen name="orders" options={{ title: 'Órdenes' }} />
        <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
        <Stack.Screen name="register" options={{ title: 'Crear cuenta' }} />
      </Stack>
      <StatusBar style="dark" />
    </AppProviders>
  );
}
