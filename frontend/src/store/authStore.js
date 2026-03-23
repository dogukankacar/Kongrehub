import { create } from 'zustand';
import { authService } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login({ email, password });
      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Giriş başarısız.', loading: false });
      return false;
    }
  },

  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(formData);
      localStorage.setItem('token', data.token);
      set({ token: data.token, user: data, loading: false });
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Kayıt başarısız.', loading: false });
      return false;
    }
  },

  fetchMe: async () => {
    if (!get().token) return;
    try {
      const user = await authService.me();
      set({ user });
    } catch {
      set({ token: null, user: null });
      localStorage.removeItem('token');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  isAdmin: () => get().user?.role === 'Admin',
  isAuthenticated: () => !!get().token,
}));
