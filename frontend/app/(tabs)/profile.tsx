import { Ionicons } from '@expo/vector-icons';
import { Link, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenScaffold } from '@/components/ScreenScaffold';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';

const ordersHref = '/orders' as Href;

export default function ProfileScreen() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <ScreenScaffold title="Perfil">
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Restaurando sesión...</Text>
        </View>
      </ScreenScaffold>
    );
  }

  return (
    <ScreenScaffold
      title="Perfil"
      description="La sesión se restaura automáticamente al abrir la aplicación.">
      {isAuthenticated && user ? (
        <>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" color="#FFFFFF" size={28} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.infoPanel}>
            <InfoRow
              icon="checkmark-circle-outline"
              label="Estado"
              value={user.confirmed ? 'Cuenta confirmada' : 'Pendiente'}
            />
            <InfoRow
              icon="shield-checkmark-outline"
              label="Acceso"
              value={user.blocked ? 'Bloqueado' : 'Activo'}
            />
          </View>

          <Link href={ordersHref} asChild>
            <Pressable style={styles.secondaryButton}>
              <Ionicons name="receipt-outline" color={Colors.text} size={20} />
              <Text style={styles.secondaryButtonText}>Ver historial de órdenes</Text>
            </Pressable>
          </Link>

          <Pressable style={styles.logoutButton} onPress={() => void logout()}>
            <Ionicons name="log-out-outline" color={Colors.danger} size={20} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.centerState}>
          <Ionicons name="person-circle-outline" color={Colors.textMuted} size={40} />
          <Text style={styles.stateText}>
            Iniciá sesión o creá una cuenta para activar las funciones de usuario.
          </Text>
          <View style={styles.authActions}>
            <Link href="/login" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Iniciar sesión</Text>
              </Pressable>
            </Link>
            <Link href="/register" asChild>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      )}
    </ScreenScaffold>
  );
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} color={Colors.primary} size={20} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    padding: 16,
  },
  avatar: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: Colors.primary,
  },
  profileText: {
    flex: 1,
    gap: 4,
  },
  username: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  email: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  infoPanel: {
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    flex: 1,
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  infoValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  authActions: {
    alignSelf: 'stretch',
    gap: 10,
  },
  primaryButton: {
    minHeight: 46,
    alignItems: 'center',
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
  secondaryButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  logoutButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: Colors.surface,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '900',
  },
});
