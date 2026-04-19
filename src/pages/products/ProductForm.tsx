import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save, X } from 'lucide-react'
import { categoriesApi } from '@/api/categories'
import { productsApi } from '@/api/products'
import type { Product, ProductPayload } from '@/types/data-models'
import { VariantMatrix } from '@/components/VariantMatrix'

interface ProductFormProps {
  product?: Product | null
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormValues {
  name: string
  price: string
  stock: string
  category_id: string
  description: string
  material_info: string
  size_guide_url: string
  shopee_link: string
}

const DEFAULT_VALUES: FormValues = {
  name: '',
  price: '',
  stock: '0',
  category_id: '',
  description: '',
  material_info: '',
  size_guide_url: '',
  shopee_link: '',
}

function toFormValues(product?: Product | null): FormValues {
  if (!product) return DEFAULT_VALUES
  return {
    name: product.name,
    price: String(product.price),
    stock: String(product.total_stock ?? 0),
    category_id: product.category_id,
    description: product.description ?? '',
    material_info: product.material_info ?? '',
    size_guide_url: product.size_guide_url ?? '',
    shopee_link: product.shopee_link ?? '',
  }
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<FormValues>(() => toFormValues(product))
  const [error, setError] = useState<string | null>(null)

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  useEffect(() => {
    setValues(toFormValues(product))
    setError(null)
  }, [product])

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      onSuccess?.()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> }) => productsApi.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })
      onSuccess?.()
    },
  })

  const isEditing = Boolean(product)
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  function buildCreatePayload(): ProductPayload {
    return {
      name: values.name.trim(),
      price: Number(values.price),
      category_id: values.category_id,
      description: values.description.trim() || undefined,
      material_info: values.material_info.trim() || undefined,
      size_guide_url: values.size_guide_url.trim() || undefined,
      shopee_link: values.shopee_link.trim() || undefined,
      variants: [
        {
          color: 'Default',
          size: 'M',
          stock: Number(values.stock),
        },
      ]
    }
  }

  function buildUpdatePayload(): Partial<ProductPayload> {
    return {
      name: values.name.trim(),
      price: Number(values.price),
      category_id: values.category_id,
      description: values.description.trim() || undefined,
      material_info: values.material_info.trim() || undefined,
      size_guide_url: values.size_guide_url.trim() || undefined,
      shopee_link: values.shopee_link.trim() || undefined,
    }
  }

  function validate() {
    if (!values.name.trim()) return 'Tên sản phẩm là bắt buộc.'
    if (!values.category_id) return 'Vui lòng chọn danh mục.'
    if (!values.price || Number.isNaN(Number(values.price)) || Number(values.price) < 0) {
      return 'Giá sản phẩm không hợp lệ.'
    }
    if (!values.stock || Number.isNaN(Number(values.stock)) || Number(values.stock) < 0) {
      return 'Tồn kho không hợp lệ.'
    }
    return null
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)

    if (isEditing && product) {
      updateMutation.mutate({ id: product.id, payload: buildUpdatePayload() })
      return
    }

    createMutation.mutate(buildCreatePayload())
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Tên sản phẩm</label>
          <input
            className="form-input"
            value={values.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Áo thun cổ tròn"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Danh mục</label>
          <select
            className="form-input"
            value={values.category_id}
            onChange={(e) => updateField('category_id', e.target.value)}
            disabled={isSubmitting || categoriesQuery.isLoading}
          >
            <option value="">Chọn danh mục</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Giá (VND)</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={values.price}
            onChange={(e) => updateField('price', e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Tồn kho</label>
          <input
            className="form-input"
            type="number"
            min={0}
            value={values.stock}
            onChange={(e) => updateField('stock', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-brand-black">Mô tả</label>
        <textarea
          className="form-input min-h-24"
          value={values.description}
          onChange={(e) => updateField('description', e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Material info</label>
          <input
            className="form-input"
            value={values.material_info}
            onChange={(e) => updateField('material_info', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Size guide URL</label>
          <input
            className="form-input"
            value={values.size_guide_url}
            onChange={(e) => updateField('size_guide_url', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Shopee link</label>
          <input
            className="form-input"
            value={values.shopee_link}
            onChange={(e) => updateField('shopee_link', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {isEditing && product && (
        <div className="rounded-xl border border-brand-border bg-brand-gray/30 p-4">
          <VariantMatrix productId={product.id} productPrice={Number(values.price) || product.price} />
        </div>
      )}

      {!isEditing && (
        <div className="rounded-xl border border-dashed border-brand-border bg-brand-gray/30 p-4 text-xs text-brand-muted">
          Variants được quản lý sau khi tạo sản phẩm xong.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {(createMutation.error || updateMutation.error) && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          Không thể lưu sản phẩm. Vui lòng thử lại.
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button type="button" className="btn-outline" onClick={onCancel} disabled={isSubmitting}>
          <X className="h-4 w-4" strokeWidth={1.8} />
          Hủy
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} /> : <Save className="h-4 w-4" strokeWidth={1.8} />}
          {isEditing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
        </button>
      </div>
    </form>
  )
}
