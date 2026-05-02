import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Tag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { categoriesApi } from '@/api/categories'

export default function CategoryListPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: async () => {
      setName('')
      setDescription('')
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Thêm danh mục thành công')
    },
    onError: () => {
      toast.error('Không thể thêm danh mục')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Xóa danh mục thành công')
    },
    onError: () => {
      toast.error('Không thể xóa danh mục')
    },
  })

  function buildSlug(input: string) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  function createCategory() {
    const trimmedName = name.trim()
    if (!trimmedName) return
    createMutation.mutate({
      name: trimmedName,
      slug: buildSlug(trimmedName),
      description: description.trim() || undefined,
    })
  }

  function removeCategory(id: string, categoryName: string) {
    const ok = window.confirm(`Xóa danh mục "${categoryName}"?`)
    if (!ok) return
    deleteMutation.mutate(id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-brand-black">Danh mục sản phẩm</h3>
          <p className="text-xs text-brand-muted mt-0.5">Tạo và chỉnh sửa danh mục</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            className="form-input"
            placeholder="Tên danh mục"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="form-input"
            placeholder="Mô tả (không bắt buộc)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="btn-primary" onClick={createCategory} disabled={createMutation.isPending || !name.trim()}>
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={2} />
            )}
            Thêm danh mục
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-gray/70 text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3 text-left">Tên</th>
                <th className="px-4 py-3 text-left">Slug</th>
                <th className="px-4 py-3 text-left">Mô tả</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categoriesQuery.isLoading && (
                <tr>
                  <td className="px-4 py-10 text-center text-brand-muted" colSpan={4}>
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                      Đang tải danh mục...
                    </span>
                  </td>
                </tr>
              )}

              {!categoriesQuery.isLoading && (categoriesQuery.data ?? []).length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-brand-muted" colSpan={4}>
                    <span className="inline-flex items-center gap-2">
                      <Tag className="h-4 w-4" strokeWidth={1.8} />
                      Chưa có danh mục nào.
                    </span>
                  </td>
                </tr>
              )}

              {(categoriesQuery.data ?? []).map((category) => (
                <tr key={category.id} className="border-t border-brand-border/70">
                  <td className="px-4 py-3 font-medium text-brand-black">{category.name}</td>
                  <td className="px-4 py-3 text-brand-muted">{category.slug}</td>
                  <td className="px-4 py-3 text-brand-muted">{category.description ?? '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        className="btn-outline px-3 py-1.5 text-red-600 hover:bg-red-50"
                        onClick={() => removeCategory(category.id, category.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
