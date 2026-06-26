import { Ionicons } from '@expo/vector-icons';
import {
  Link,
  Redirect,
  router,
  useLocalSearchParams,
  type Href,
} from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ScreenScaffold } from '@/components/ScreenScaffold';
import { Colors } from '@/constants/colors';
import { getApiErrorMessage } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoading && isAuthenticated) {
    return <Redirect href="/profile" />;
  }

  async function handleSubmit() {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError('Ingresá email y contraseña');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await login({ email: trimmedEmail, password });
      router.replace((returnTo || '/profile') as Href);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'No se pudo iniciar sesión'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenScaffold
      title="Iniciar sesión"
      description="Accedé para guardar favoritos y gestionar tu perfil.">
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" color={Colors.textMuted} size={20} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholder="tu@email.com"
              placeholderTextColor={Colors.textMuted}
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              color={Colors.textMuted}
              size={20}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="password"
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.submitButton, isSubmitting ? styles.disabled : null]}
          disabled={isSubmitting}
          onPress={handleSubmit}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Entrar</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tenés cuenta?</Text>
        <Link href="/register" asChild>
          <Pressable>
            <Text style={styles.footerLink}>Crear una cuenta</Text>
          </Pressable>
        </Link>
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    padding: 16,
  },
  field: {
    gap: 8,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  inputWrap: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  error: {
    color: Colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  disabled: {
    opacity: 0.65,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '900',
  },
});
