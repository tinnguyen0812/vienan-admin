import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { productsApi } from '@/api/products'
import ProductForm from './ProductForm'

export default function ProductEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.get(id ?? ''),
    enabled: Boolean(id),
  })

  if (productQuery.isLoading) {
    return (
      <div className="card p-8 text-center text-brand-muted">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
          Đang tải dữ liệu sản phẩm...
        </span>
      </div>
    )
  }

  if (!productQuery.data) {
    return <div className="card p-6 text-sm text-red-600">Không tìm thấy sản phẩm.</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <Link to="/products" className="inline-flex items-center gap-1 text-xs text-brand-muted hover:text-brand-black">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
          Quay lại danh sách sản phẩm
        </Link>
        <h3 className="mt-1 text-base font-semibold text-brand-black">Chỉnh sửa sản phẩm</h3>
      </div>

      <div className="card p-5">
        <ProductForm
          product={productQuery.data}
          onSuccess={() => navigate('/products', { replace: true })}
          onCancel={() => navigate('/products', { replace: true })}
        />
      </div>
    </div>
  )
}
