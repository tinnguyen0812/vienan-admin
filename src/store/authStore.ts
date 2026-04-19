import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/data-models'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User | null) => void
  isSuperAdmin: () => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),

      isSuperAdmin: () => get().user?.role === 'SUPER_ADMIN',

      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'vien-an-admin-auth', // localStorage key
      onRehydrateStorage: () => (state) => {
        // Re-derive isAuthenticated after hydration from localStorage
        if (state) {
          state.isAuthenticated = Boolean(state.token)
        }
      },
    },
  ),
)
