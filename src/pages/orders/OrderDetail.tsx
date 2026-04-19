import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { ordersApi } from '@/api/orders'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types/data-models'

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dateString))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const orderQuery = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.get(id ?? ''),
    enabled: Boolean(id),
  })

  const order = orderQuery.data
  const [status, setStatus] = useState<OrderStatus | ''>('')

  const updateStatusMutation = useMutation({
    mutationFn: (nextStatus: OrderStatus) => ordersApi.updateStatus(id ?? '', { status: nextStatus }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      await queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
  })

  const availableStatuses = useMemo(() => Object.keys(ORDER_STATUS_LABELS) as OrderStatus[], [])
  const subtotal = order?.items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0) ?? 0

  if (orderQuery.isLoading) {
    return (
      <div className="card p-10 text-center text-brand-muted">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
          Đang tải chi tiết đơn hàng...
        </span>
      </div>
    )
  }

  if (!order) {
    return <div className="card p-6 text-sm text-red-600">Không tìm thấy đơn hàng.</div>
  }

  async function submitStatusUpdate() {
    if (!status) return
    updateStatusMutation.mutate(status)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-1 text-xs text-brand-muted hover:text-brand-black">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
            Quay lại danh sách đơn hàng
          </Link>
          <h3 className="mt-1 text-base font-semibold text-brand-black">Chi tiết đơn {order.order_code}</h3>
          <p className="text-xs text-brand-muted">Tạo lúc {formatDate(order.created_at)}</p>
        </div>
        <span className="badge bg-brand-gray text-brand-black">{ORDER_STATUS_LABELS[order.status]}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="card p-4">
            <h4 className="mb-3 text-sm font-semibold text-brand-black">Thông tin khách hàng</h4>
            <div className="space-y-1 text-sm">
              <p><span className="text-brand-muted">Khách hàng:</span> {order.customer_name}</p>
              <p><span className="text-brand-muted">Số điện thoại:</span> {order.customer_phone}</p>
              <p>
                <span className="text-brand-muted">Địa chỉ:</span> {order.shipping_address.fullAddress}
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-brand-border px-4 py-3">
              <h4 className="text-sm font-semibold text-brand-black">Sản phẩm trong đơn</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-brand-gray/60 text-xs uppercase tracking-wide text-brand-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">Sản phẩm</th>
                    <th className="px-4 py-2 text-left">SKU</th>
                    <th className="px-4 py-2 text-left">Màu/Size</th>
                    <th className="px-4 py-2 text-right">SL</th>
                    <th className="px-4 py-2 text-right">Đơn giá</th>
                    <th className="px-4 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-brand-border/70">
                      <td className="px-4 py-3">{item.product_name}</td>
                      <td className="px-4 py-3 text-brand-muted">
                        {item.sku ?? item.variant_sku ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-brand-muted">{item.color} / {item.size}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h4 className="mb-3 text-sm font-semibold text-brand-black">Cập nhật trạng thái</h4>
            <div className="space-y-3">
              <select
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
              >
                <option value="">Chọn trạng thái mới</option>
                {availableStatuses.map((item) => (
                  <option key={item} value={item}>{ORDER_STATUS_LABELS[item]}</option>
                ))}
              </select>
              <button
                className="btn-primary w-full"
                disabled={!status || updateStatusMutation.isPending}
                onClick={submitStatusUpdate}
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
                ) : (
                  <Save className="h-4 w-4" strokeWidth={1.8} />
                )}
                Lưu trạng thái
              </button>
              {updateStatusMutation.isError && (
                <p className="text-xs text-red-600">Cập nhật trạng thái thất bại.</p>
              )}
              {updateStatusMutation.isSuccess && (
                <p className="text-xs text-emerald-600">Đã cập nhật trạng thái đơn hàng.</p>
              )}
            </div>
          </div>

          <div className="card p-4">
            <h4 className="mb-3 text-sm font-semibold text-brand-black">Tóm tắt thanh toán</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Tạm tính</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-brand-border pt-2 font-semibold">
                <span>Tổng tiền</span>
                <span className="tabular-nums">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
