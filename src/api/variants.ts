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

export const variantsApi = {
  list: async (productId: string): Promise<ProductVariant[]> => {
    const { data } = await apiClient.get<ProductVariant[]>(`/products/${productId}/variants`)
    return data
  },

  bulkCreate: async (productId: string, variants: Partial<ProductVariantPayload>[]): Promise<ProductVariant[]> => {
    const { data } = await apiClient.post<ProductVariant[]>(`/products/${productId}/variants/bulk`, { variants })
    return data
  },

  update: async (productId: string, variantId: string, dto: Partial<ProductVariantPayload>): Promise<ProductVariant> => {
    const { data } = await apiClient.patch<ProductVariant>(`/products/${productId}/variants/${variantId}`, dto)
    return data
  },

  delete: async (productId: string, variantId: string): Promise<void> => {
    await apiClient.delete(`/products/${productId}/variants/${variantId}`)
  },
}
