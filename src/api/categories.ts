import { apiClient } from './client'
import type { Category, CategoryPayload } from '@/types/data-models'

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/categories')
    return data
  },

  get: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<Category>(`/categories/${id}`)
    return data
  },

  create: async (payload: CategoryPayload): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/categories', payload)
    return data
  },

  update: async (id: string, payload: Partial<CategoryPayload>): Promise<Category> => {
    const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`)
  },
}
