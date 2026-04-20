import { apiClient } from './client'
import type { AuthResponse, LoginPayload } from '@/types/data-models'

// API response shape: { success: true, data: { accessToken, user } }
interface ApiWrapper<T> { success: boolean; data: T }

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<ApiWrapper<AuthResponse>>('/auth/login', payload)
    return data.data   // unwrap the nested data field from ResponseInterceptor
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout').catch(() => {}) // ignore errors on logout
  },
}
