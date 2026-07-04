import { create } from 'zustand';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId?: string | null;
};

type AuthState = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    set({ user: null, token: null });
  }
}));
