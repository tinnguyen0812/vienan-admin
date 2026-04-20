import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/store/authStore'

// ─── Axios instance ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

// ─── Request interceptor – attach JWT ────────────────────────────────────────

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor – handle 401 ───────────────────────────────────────
// Only auto-logout on 401 if the user was already authenticated.
// Avoids boot-loop where Dashboard fires API calls before token is hydrated.

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginEndpoint) {
      const { isAuthenticated, logout } = useAuthStore.getState()
      // Only force-logout if user was considered authenticated
      // (prevents redirect before initial hydration completes)
      if (isAuthenticated) {
        logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
