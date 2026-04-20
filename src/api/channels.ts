import { apiClient } from './client'
import type { Channel, ChannelApiKey, ChannelPayload } from '@/types/data-models'

interface ApiWrapper<T> { success: boolean; data: T }

export const channelsApi = {
  list: async (): Promise<Channel[]> => {
    const { data } = await apiClient.get<ApiWrapper<Channel[]>>('/channels')
    return Array.isArray(data.data) ? data.data : []
  },

  create: async (payload: ChannelPayload): Promise<Channel> => {
    const { data } = await apiClient.post<ApiWrapper<Channel>>('/channels', payload)
    return data.data
  },

  update: async (id: string, payload: Partial<ChannelPayload>): Promise<Channel> => {
    const { data } = await apiClient.patch<ApiWrapper<Channel>>(`/channels/${id}`, payload)
    return data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/channels/${id}`)
  },

  listApiKeys: async (): Promise<ChannelApiKey[]> => {
    const { data } = await apiClient.get<ApiWrapper<ChannelApiKey[]>>('/auth/api-keys')
    return Array.isArray(data.data) ? data.data : []
  },

  createApiKey: async (channelId: string): Promise<{ key: string }> => {
    const { data } = await apiClient.post<ApiWrapper<{ key: string }>>('/auth/api-keys', { channelId })
    return data.data
  },

  revokeApiKey: async (id: string): Promise<void> => {
    await apiClient.patch(`/auth/api-keys/${id}/revoke`)
  },
}
