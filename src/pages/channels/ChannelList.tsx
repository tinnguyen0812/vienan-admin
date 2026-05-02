import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, ShieldAlert, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { channelsApi } from '@/api/channels'
import { useAuthStore } from '@/store/authStore'

export default function ChannelListPage() {
  const queryClient = useQueryClient()
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin())
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const channelsQuery = useQuery({
    queryKey: ['channels'],
    queryFn: channelsApi.list,
    enabled: isSuperAdmin,
  })

  const createChannelMutation = useMutation({
    mutationFn: channelsApi.create,
    onSuccess: async () => {
      setName('')
      setCode('')
      await queryClient.invalidateQueries({ queryKey: ['channels'] })
      toast.success('Tạo channel thành công')
    },
    onError: () => {
      toast.error('Không thể tạo channel')
    },
  })

  const deleteChannelMutation = useMutation({
    mutationFn: channelsApi.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['channels'] })
      toast.success('Xóa channel thành công')
    },
    onError: () => {
      toast.error('Không thể xóa channel')
    },
  })

  const createApiKeyMutation = useMutation({
    mutationFn: channelsApi.createApiKey,
    onSuccess: () => {
      toast.success('Tạo API key thành công')
    },
    onError: () => {
      toast.error('Không thể tạo API key')
    },
  })

  function createChannel() {
    if (!name.trim() || !code.trim()) return
    createChannelMutation.mutate({ name: name.trim(), code: code.trim().toUpperCase() })
  }

  function deleteChannel(id: string, label: string) {
    const ok = window.confirm(`Xóa channel \"${label}\"?`)
    if (!ok) return
    deleteChannelMutation.mutate(id)
  }

  if (!isSuperAdmin) {
    return (
      <div className="card flex items-center gap-3 p-5 text-amber-700 bg-amber-50 border-amber-200">
        <ShieldAlert className="h-5 w-5" strokeWidth={1.8} />
        Bạn không có quyền truy cập trang quản lý channel.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-brand-black">Quản lý Channels</h3>
        <p className="mt-0.5 text-xs text-brand-muted">Dành cho Super Admin</p>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px_auto]">
          <input
            className="form-input"
            placeholder="Tên channel"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="form-input"
            placeholder="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="btn-primary" onClick={createChannel} disabled={createChannelMutation.isPending || !name.trim() || !code.trim()}>
            {createChannelMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={2} />
            )}
            Tạo channel
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-gray/70 text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3 text-left">Tên</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-right">API key</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {channelsQuery.isLoading && (
                <tr>
                  <td className="px-4 py-10 text-center text-brand-muted" colSpan={5}>
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                      Đang tải channels...
                    </span>
                  </td>
                </tr>
              )}

              {!channelsQuery.isLoading && (channelsQuery.data ?? []).length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-brand-muted" colSpan={5}>
                    Chưa có channel nào.
                  </td>
                </tr>
              )}

              {(channelsQuery.data ?? []).map((channel) => (
                <tr key={channel.id} className="border-t border-brand-border/70">
                  <td className="px-4 py-3 font-medium text-brand-black">{channel.name}</td>
                  <td className="px-4 py-3 text-brand-muted">{channel.code}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${channel.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {channel.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="btn-outline px-3 py-1.5"
                      onClick={() => createApiKeyMutation.mutate(channel.id)}
                      disabled={createApiKeyMutation.isPending}
                    >
                      Tạo API key
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="btn-outline px-3 py-1.5 text-red-600 hover:bg-red-50"
                      onClick={() => deleteChannel(channel.id, channel.name)}
                      disabled={deleteChannelMutation.isPending}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {createApiKeyMutation.data?.key && (
        <div className="card border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs text-emerald-700">API key mới tạo (chỉ hiển thị 1 lần):</p>
          <p className="mt-1 break-all rounded-md bg-white px-3 py-2 text-xs font-mono text-emerald-800 border border-emerald-100">
            {createApiKeyMutation.data.key}
          </p>
        </div>
      )}
    </div>
  )
}
