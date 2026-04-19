import { apiClient } from './client'
import type { PaginatedResponse, Product, ProductPayload, ProductImage } from '@/types/data-models'

export interface ProductListParams {
  page?: number
  limit?: number
  search?: string
  category_id?: string
  categoryId?: string
}

export const productsApi = {
  list: async (params: ProductListParams = {}): Promise<PaginatedResponse<Product>> => {
    const normalizedParams = {
      ...params,
      category_id: params.category_id ?? params.categoryId,
    }
    const { data } = await apiClient.get<PaginatedResponse<Product>>('/products', { params: normalizedParams })
    return data
  },

  get: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<Product>(`/products/${id}`)
    return data
  },

  create: async (payload: ProductPayload): Promise<Product> => {
    const { data } = await apiClient.post<Product>('/products', payload)
    return data
  },

  update: async (id: string, payload: Partial<ProductPayload>): Promise<Product> => {
    const { data } = await apiClient.patch<Product>(`/products/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },

  /** Upload images – sends multipart/form-data */
  uploadImages: async (productId: string, files: File[]): Promise<ProductImage[]> => {
    const form = new FormData()
    files.forEach((f) => form.append('images', f))
    const { data } = await apiClient.post<ProductImage[]>(
      `/products/${productId}/images`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  },

  deleteImage: async (productId: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/products/${productId}/images/${imageId}`)
  },
}
