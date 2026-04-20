import { apiClient } from './client'
import type { PaginatedResponse, Product, ProductPayload, ProductImage } from '@/types/data-models'

export interface ProductListParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
}

// Backend wraps all responses in { success, data, timestamp }
interface ApiWrapper<T> { success: boolean; data: T; timestamp?: string }

// Backend pagination shape
interface BackendPage<T> {
  items: T[]
  meta: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
    total_pages?: number
  }
}

/** Normalizes backend { success, data: { items, meta } } → PaginatedResponse */
function unwrapPage<T>(raw: ApiWrapper<BackendPage<T>>): PaginatedResponse<T> {
  const { items, meta } = raw.data
  return {
    data: items ?? [],
    total: meta?.total ?? 0,
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    total_pages: meta?.totalPages ?? meta?.total_pages ?? 1,
  }
}

export const productsApi = {
  /** Admin JWT endpoint — GET /products/admin/list */
  list: async (params: ProductListParams = {}): Promise<PaginatedResponse<Product>> => {
    const normalizedParams = {
      ...params,
      categoryId: params.categoryId,
    }
    const { data } = await apiClient.get<ApiWrapper<BackendPage<Product>>>(
      '/products/admin/list',
      { params: normalizedParams },
    )
    return unwrapPage(data)
  },

  /** Admin JWT endpoint — GET /products/admin/:id */
  get: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<ApiWrapper<Product>>(`/products/admin/${id}`)
    return data.data
  },

  create: async (payload: ProductPayload): Promise<Product> => {
    const { data } = await apiClient.post<ApiWrapper<Product>>('/products', payload)
    return data.data
  },

  update: async (id: string, payload: Partial<ProductPayload>): Promise<Product> => {
    const { data } = await apiClient.patch<ApiWrapper<Product>>(`/products/${id}`, payload)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },

  /** Upload images – sends multipart/form-data */
  uploadImages: async (productId: string, files: File[]): Promise<ProductImage[]> => {
    const form = new FormData()
    files.forEach((f) => form.append('images', f))
    const { data } = await apiClient.post<ApiWrapper<ProductImage[]>>(
      `/products/${productId}/images`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data.data
  },

  deleteImage: async (productId: string, imageId: string): Promise<void> => {
    await apiClient.delete(`/products/${productId}/images/${imageId}`)
  },
}
