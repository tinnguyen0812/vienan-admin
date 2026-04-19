import { apiClient } from './client'
import type { Order, OrderStatus, OrderStatusUpdatePayload, PaginatedResponse } from '@/types/data-models'

export interface OrderListParams {
  page?: number
  limit?: number
  status?: OrderStatus
  search?: string
  channelId?: string
}

export const ordersApi = {
  list: async (params: OrderListParams = {}): Promise<PaginatedResponse<Order>> => {
    const { data } = await apiClient.get<PaginatedResponse<Order>>('/admin/orders', { params })
    return data
  },

  get: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/admin/orders/${id}`)
    return data
  },

  updateStatus: async (id: string, payload: OrderStatusUpdatePayload): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/admin/orders/${id}/status`, payload)
    return data
  },
}
