import {
  Package,
  ShoppingCart,
  Tag,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Loader2,
} from 'lucide-react'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { categoriesApi } from '@/api/categories'
import { ordersApi } from '@/api/orders'
import { productsApi } from '@/api/products'

interface StatCardProps {
  label:    string
  value:    string | number
  icon:     React.ElementType
  iconBg:   string
  iconColor:string
  trend?:   string
}

function StatCard({ label, value, icon: Icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-brand-muted">{label}</p>
        <p className="mt-0.5 text-xl font-semibold tabular-nums text-brand-black">{value}</p>
        {trend && <p className="mt-0.5 text-[11px] text-brand-muted">{trend}</p>}
      </div>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function DashboardPage() {
  const productsQuery = useQuery({
    queryKey: ['dashboard-products'],
    queryFn: () => productsApi.list({ page: 1, limit: 1 }),
  })

  const categoriesQuery = useQuery({
    queryKey: ['dashboard-categories'],
    queryFn: categoriesApi.list,
  })

  const ordersQuery = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: () => ordersApi.list({ page: 1, limit: 200 }),
  })

  const statusMap = useMemo(() => {
    const source = ordersQuery.data?.data ?? []
    return {
      pending: source.filter((order) => order.status === 'pending').length,
      shipping: source.filter((order) => order.status === 'shipping').length,
      delivered: source.filter((order) => order.status === 'delivered').length,
      cancelled: source.filter((order) => order.status === 'cancelled').length,
    }
  }, [ordersQuery.data])

  const monthlyRevenue = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    return (ordersQuery.data?.data ?? [])
      .filter((order) => {
        if (order.status !== 'delivered') return false
        const createdAt = new Date(order.created_at)
        return createdAt.getMonth() === month && createdAt.getFullYear() === year
      })
      .reduce((sum, order) => sum + order.total_amount, 0)
  }, [ordersQuery.data])

  const recentOrders = (ordersQuery.data?.data ?? []).slice(0, 5)

  const ORDER_SUMMARY = [
    { status: 'Chờ xử lý', count: statusMap.pending, color: 'text-amber-600', bg: 'bg-amber-50', Icon: Clock },
    { status: 'Đang giao', count: statusMap.shipping, color: 'text-blue-600', bg: 'bg-blue-50', Icon: Truck },
    { status: 'Đã giao', count: statusMap.delivered, color: 'text-emerald-600', bg: 'bg-emerald-50', Icon: CheckCircle2 },
    { status: 'Đã hủy', count: statusMap.cancelled, color: 'text-red-600', bg: 'bg-red-50', Icon: XCircle },
  ]

  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading || ordersQuery.isLoading

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="card p-3 text-xs text-brand-muted">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
            Đang đồng bộ dữ liệu dashboard...
          </span>
        </div>
      )}

      {/* ── Top stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tổng sản phẩm"
          value={productsQuery.data?.total ?? 0}
          icon={Package}
          iconBg="bg-brand-black"
          iconColor="text-white"
        />
        <StatCard
          label="Đơn hàng hôm nay"
          value={statusMap.pending + statusMap.shipping}
          icon={ShoppingCart}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Doanh thu tháng"
          value={formatCurrency(monthlyRevenue)}
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          label="Danh mục"
          value={categoriesQuery.data?.length ?? 0}
          icon={Tag}
          iconBg="bg-brand-gray"
          iconColor="text-brand-muted"
        />
      </div>

      {/* ── Order status summary ────────────────────────────────── */}
      <div className="card p-5">
        <p className="mb-4 text-sm font-semibold text-brand-black">Trạng thái đơn hàng</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ORDER_SUMMARY.map(({ status, count, color, bg, Icon }) => (
            <div key={status} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${bg}`}>
              <Icon className={`h-5 w-5 shrink-0 ${color}`} strokeWidth={1.8} />
              <div>
                <p className={`text-lg font-semibold tabular-nums leading-none ${color}`}>{count}</p>
                <p className="mt-0.5 text-xs text-brand-muted">{status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Placeholder recent orders ───────────────────────────── */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-brand-black">Đơn hàng gần đây</p>
          <a href="/orders" className="text-xs font-medium text-brand-muted hover:text-brand-black transition-colors">
            Xem tất cả →
          </a>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-xs text-brand-muted">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg border border-brand-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-brand-black">{order.order_code}</p>
                  <p className="text-xs text-brand-muted">{order.customer_name}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-brand-black">{formatCurrency(order.total_amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
