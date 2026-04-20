import { apiClient } from './client'
import type { Category, CategoryPayload } from '@/types/data-models'

// Backend wraps responses in { success, data, timestamp }
interface ApiWrapper<T> { success: boolean; data: T }

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<ApiWrapper<Category[]>>('/categories')
    return data.data   // unwrap { success, data: [...] }
  },

  get: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<ApiWrapper<Category>>(`/categories/${id}`)
    return data.data
  },

  create: async (payload: CategoryPayload): Promise<Category> => {
    const { data } = await apiClient.post<ApiWrapper<Category>>('/categories', payload)
    return data.data
  },

  update: async (id: string, payload: Partial<CategoryPayload>): Promise<Category> => {
    const { data } = await apiClient.patch<ApiWrapper<Category>>(`/categories/${id}`, payload)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}
