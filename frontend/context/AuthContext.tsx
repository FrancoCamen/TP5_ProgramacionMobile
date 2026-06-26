import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { authService } from '@/services/authService';
import { isUnauthorizedError } from '@/services/api';
import { tokenStorage } from '@/storage/tokenStorage';
import type {
  LoginCredentials,
  RegisterData,
  User,
} from '@/types/user';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await tokenStorage.remove();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const storedToken = await tokenStorage.get();

        if (!storedToken) {
          return;
        }

        if (isMounted) {
          setToken(storedToken);
        }

        const currentUser = await authService.getCurrentUser();

        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error) {
        if (isUnauthorizedError(error)) {
          await tokenStorage.remove();
        }

        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    await tokenStorage.set(response.jwt);
    setToken(response.jwt);
    setUser(response.user);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const response = await authService.register(data);
    await tokenStorage.set(response.jwt);
    setToken(response.jwt);
    setUser(response.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [isLoading, login, logout, register, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
