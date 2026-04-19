import { apiClient } from './client'
import type { Channel, ChannelApiKey, ChannelPayload } from '@/types/data-models'

export const channelsApi = {
  list: async (): Promise<Channel[]> => {
    const { data } = await apiClient.get<Channel[]>('/channels')
    return data
  },

  create: async (payload: ChannelPayload): Promise<Channel> => {
    const { data } = await apiClient.post<Channel>('/channels', payload)
    return data
  },

  update: async (id: string, payload: Partial<ChannelPayload>): Promise<Channel> => {
    const { data } = await apiClient.patch<Channel>(`/channels/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/channels/${id}`)
  },

  listApiKeys: async (): Promise<ChannelApiKey[]> => {
    const { data } = await apiClient.get<ChannelApiKey[]>('/auth/api-keys')
    return data
  },

  createApiKey: async (channelId: string): Promise<{ key: string }> => {
    const { data } = await apiClient.post<{ key: string }>('/auth/api-keys', { channelId })
    return data
  },

  revokeApiKey: async (id: string): Promise<void> => {
    await apiClient.patch(`/auth/api-keys/${id}/revoke`)
  },
}
