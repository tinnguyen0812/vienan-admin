import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Loader2, Search, ShoppingCart } from 'lucide-react'
import { ordersApi } from '@/api/orders'
import { useAuthStore } from '@/store/authStore'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types/data-models'

const PAGE_SIZE = 10

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(dateString))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export default function OrderListPage() {
  const statuses = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin())

  const ordersQuery = useQuery({
    queryKey: ['orders', { status, search, page }],
    queryFn: () =>
      ordersApi.list({
        page,
        limit: PAGE_SIZE,
        status,
        search: search || undefined,
      }),
  })

  const orders = ordersQuery.data?.data ?? []
  const totalPages = ordersQuery.data?.total_pages ?? 1

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput.trim())
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-brand-black">Danh sách đơn hàng</h3>
          <p className="text-xs text-brand-muted mt-0.5">Theo dõi và cập nhật trạng thái đơn hàng</p>
        </div>
        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            className={`badge ${status === undefined ? 'bg-brand-black text-white' : 'bg-brand-gray text-brand-muted'}`}
            onClick={() => {
              setStatus(undefined)
              setPage(1)
            }}
          >
            Tất cả
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              className={`badge ${status === s ? ORDER_STATUS_COLORS[s] : 'bg-brand-gray text-brand-muted'}`}
              onClick={() => {
                setStatus(s)
                setPage(1)
              }}
            >
              {ORDER_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" strokeWidth={1.8} />
          <input
            className="form-input pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách hàng, số điện thoại"
          />
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-brand-gray/70 text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3 text-left">Mã đơn</th>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Ngày tạo</th>
                {isSuperAdmin && <th className="px-4 py-3 text-left">Channel</th>}
              </tr>
            </thead>
            <tbody>
              {ordersQuery.isLoading && (
                <tr>
                  <td className="px-4 py-10 text-center text-brand-muted" colSpan={isSuperAdmin ? 6 : 5}>
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                      Đang tải đơn hàng...
                    </span>
                  </td>
                </tr>
              )}

              {!ordersQuery.isLoading && orders.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-center text-brand-muted" colSpan={isSuperAdmin ? 6 : 5}>
                    <span className="inline-flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" strokeWidth={1.8} />
                      Không có đơn hàng phù hợp.
                    </span>
                  </td>
                </tr>
              )}

              {orders.map((order) => (
                <tr key={order.id} className="border-t border-brand-border/70 hover:bg-brand-gray/40">
                  <td className="px-4 py-3 font-medium text-brand-black">
                    <Link className="hover:underline" to={`/orders/${order.id}`}>{order.order_code}</Link>
                  </td>
                  <td className="px-4 py-3">
                    <p>{order.customer_name}</p>
                    <p className="text-xs text-brand-muted">{order.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                  </td>
                  <td className="px-4 py-3 text-brand-muted">{formatDate(order.created_at)}</td>
                  {isSuperAdmin && <td className="px-4 py-3 text-brand-muted">-</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-brand-border px-4 py-3">
          <button className="btn-outline px-3 py-1.5" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </button>
          <span className="text-xs text-brand-muted tabular-nums">Trang {page}/{totalPages}</span>
          <button className="btn-outline px-3 py-1.5" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Sau
          </button>
        </div>
      </div>
    </div>
  )
}
