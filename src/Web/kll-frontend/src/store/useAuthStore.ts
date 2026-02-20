import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  customerId: string;
  customerEmail: string;
  customerName: string;
  isLoggedIn: boolean;
  login: (name: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customerId: '',
      customerEmail: '',
      customerName: '',
      isLoggedIn: false,

      login: (name, email) =>
        set({
          customerId: `cust-${Date.now()}`,
          customerEmail: email,
          customerName: name,
          isLoggedIn: true,
        }),

      logout: () =>
        set({ customerId: '', customerEmail: '', customerName: '', isLoggedIn: false }),
    }),
    { name: 'kll-auth' }
  )
);
