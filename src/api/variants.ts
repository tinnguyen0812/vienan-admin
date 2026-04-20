import { apiClient } from './client'

export interface ProductVariant {
  id: string
  productId: string
  size: string
  color: string
  colorCode: string | null
  sku: string
  stock: number
  imageUrl: string | null
  isActive: boolean
}

export interface ProductVariantPayload {
  size: string
  color: string
  colorCode?: string | null
  sku?: string
  stock?: number
  imageUrl?: string | null
  isActive?: boolean
}

interface ApiWrapper<T> { success: boolean; data: T }

export const variantsApi = {
  list: async (productId: string): Promise<ProductVariant[]> => {
    const { data } = await apiClient.get<ApiWrapper<ProductVariant[]>>(
      `/products/${productId}/variants`,
    )
    // Unwrap { success, data: [...] } from ResponseInterceptor
    return Array.isArray(data.data) ? data.data : []
  },

  bulkCreate: async (productId: string, variants: Partial<ProductVariantPayload>[]): Promise<ProductVariant[]> => {
    const { data } = await apiClient.post<ApiWrapper<ProductVariant[]>>(
      `/products/${productId}/variants/bulk`,
      { variants },
    )
    return Array.isArray(data.data) ? data.data : []
  },

  update: async (productId: string, variantId: string, dto: Partial<ProductVariantPayload>): Promise<ProductVariant> => {
    const { data } = await apiClient.patch<ApiWrapper<ProductVariant>>(
      `/products/${productId}/variants/${variantId}`,
      dto,
    )
    return data.data
  },

  delete: async (productId: string, variantId: string): Promise<void> => {
    await apiClient.delete(`/products/${productId}/variants/${variantId}`)
  },
}
