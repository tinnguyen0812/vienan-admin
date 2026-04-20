import { apiClient } from './client'
import type { Order, OrderStatus, OrderStatusUpdatePayload, PaginatedResponse } from '@/types/data-models'

export interface OrderListParams {
  page?: number
  limit?: number
  status?: OrderStatus
  search?: string
  channelId?: string
}

interface ApiWrapper<T> { success: boolean; data: T }
interface BackendPage<T> {
  items: T[]
  meta: { total?: number; page?: number; limit?: number; totalPages?: number; total_pages?: number }
}

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

export const ordersApi = {
  list: async (params: OrderListParams = {}): Promise<PaginatedResponse<Order>> => {
    const { data } = await apiClient.get<ApiWrapper<BackendPage<Order>>>('/admin/orders', { params })
    return unwrapPage(data)
  },

  get: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get<ApiWrapper<Order>>(`/admin/orders/${id}`)
    return data.data
  },

  updateStatus: async (id: string, payload: OrderStatusUpdatePayload): Promise<Order> => {
    const { data } = await apiClient.patch<ApiWrapper<Order>>(`/admin/orders/${id}/status`, payload)
    return data.data
  },
}
