import { api } from '@/services/api';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types/user';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/local', {
      identifier: credentials.email,
      password: credentials.password,
    });

    return data;
  },

  async register(payload: RegisterData): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      '/auth/local/register',
      payload
    );

    return data;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>('/users/me');
    return data;
  },
};
