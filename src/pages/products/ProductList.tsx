import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Image as ImageIcon, Loader2, Package, Plus, Search, Trash2 } from 'lucide-react'
import { categoriesApi } from '@/api/categories'
import { productsApi } from '@/api/products'
import type { Product } from '@/types/data-models'
import ProductForm from './ProductForm'

const PAGE_SIZE = 10

function formatCurrency(value: number | string) {
  const amount = typeof value === 'string' ? Number(value) : value
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number.isNaN(amount) ? 0 : amount)
}

export default function ProductListPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  const productsQuery = useQuery({
    queryKey: ['products', { page, search, categoryId }],
    queryFn: () =>
      productsApi.list({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        categoryId: categoryId || undefined,
      }),
  })

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const products = productsQuery.data?.data ?? []
  const total = productsQuery.data?.total ?? 0
  const totalPages = productsQuery.data?.total_pages ?? 1

  const paginationLabel = useMemo(() => {
    if (!products.length) return '0 kết quả'
    const start = (page - 1) * PAGE_SIZE + 1
    const end = start + products.length - 1
    return `${start}-${end} / ${total}`
  }, [page, products.length, total])

  function openCreateModal() {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  function openEditModal(product: Product) {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  function handleDelete(product: Product) {
    const ok = window.confirm(`Xóa sản phẩm "${product.name}"?`)
    if (!ok) return
    deleteMutation.mutate(product.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-brand-black">Danh sách sản phẩm</h3>
          <p className="mt-0.5 text-xs text-brand-muted">Quản lý toàn bộ sản phẩm Viên An</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_240px_auto]">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" strokeWidth={1.8} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="form-input pl-9"
              placeholder="Tìm theo tên sản phẩm"
            />
          </form>

          <select
            className="form-input"
            value={categoryId}
            onChange={(e) => {
              setPage(1)
              setCategoryId(e.target.value)
            }}
            disabled={categoriesQuery.isLoading}
          >
            <option value="">Tất cả danh mục</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>

          <button className="btn-outline" onClick={() => { setPage(1); setSearch(searchInput.trim()) }}>
            Áp dụng
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-gray/70 text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3 text-left">Sản phẩm</th>
                <th className="px-4 py-3 text-right">Giá</th>
                <th className="px-4 py-3 text-right">Tồn kho</th>
                <th className="px-4 py-3 text-left">Danh mục</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {productsQuery.isLoading && (
                <tr>
                  <td className="px-4 py-10 text-center text-brand-muted" colSpan={6}>
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                      Đang tải sản phẩm...
                    </span>
                  </td>
                </tr>
              )}

              {!productsQuery.isLoading && products.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-brand-muted" colSpan={6}>
                    <span className="inline-flex items-center gap-2">
                      <Package className="h-4 w-4" strokeWidth={1.8} />
                      Không có sản phẩm phù hợp.
                    </span>
                  </td>
                </tr>
              )}

              {products.map((product) => {
                const thumbnailUrl = product.image ?? product.images?.[0]
                
                return (
                <tr key={product.id} className="border-t border-brand-border/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-brand-border bg-brand-gray/50">
                        {thumbnailUrl ? (
                          <img src={thumbnailUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-brand-muted" strokeWidth={1.5} />
                        )}
                      </div>
                      <span className="font-medium text-brand-black line-clamp-2">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{product.stock}</td>
                  <td className="px-4 py-3">{product.category?.name ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock > 0 ? 'Đang bán' : 'Hết hàng'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button className="btn-outline px-3 py-1.5" onClick={() => openEditModal(product)}>
                        <Edit className="h-3.5 w-3.5" strokeWidth={1.8} />
                        Sửa
                      </button>
                      <button className="btn-outline px-3 py-1.5 text-red-600 hover:bg-red-50" onClick={() => handleDelete(product)}>
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-brand-border px-4 py-3 text-xs text-brand-muted">
          <span>{paginationLabel}</span>
          <div className="flex items-center gap-2">
            <button className="btn-outline px-3 py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Trước
            </button>
            <span className="tabular-nums">Trang {page}/{totalPages}</span>
            <button className="btn-outline px-3 py-1.5" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Sau
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-brand-black/50 p-4">
          <div className="card max-h-[90dvh] w-full max-w-3xl overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-base font-semibold text-brand-black">
                {editingProduct ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}
              </h4>
              <button className="btn-ghost px-3 py-1.5" onClick={closeModal}>Đóng</button>
            </div>
            <ProductForm
              product={editingProduct}
              onSuccess={closeModal}
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  )
}
