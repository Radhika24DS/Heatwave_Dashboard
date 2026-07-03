import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setToken: (token) => {
        try {
          const decoded = jwtDecode(token);
          set({ token, user: decoded });
        } catch (error) {
          console.error("Invalid token:", error);
          set({ token: null, user: null });
        }
      },

      logout: () => set({ token: null, user: null }),

      isAuthenticated: () => !!get().token,
      
      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        return user.role === role;
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
