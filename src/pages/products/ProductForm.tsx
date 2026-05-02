import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { categoriesApi } from '@/api/categories'
import { channelsApi } from '@/api/channels'
import { productsApi } from '@/api/products'
import { useAuthStore } from '@/store/authStore'
import type { Product, ProductPayload } from '@/types/data-models'
import { VariantMatrix } from '@/components/VariantMatrix'

const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Giá không hợp lệ'),
  stock: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Tồn kho không hợp lệ'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  channelId: z.string().optional(),
  description: z.string().optional(),
  materialInfo: z.string().optional(),
  sizeGuideUrl: z.string().optional(),
  shopeeLink: z.string().optional(),
})

type ProductSchema = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: Product | null
  onSuccess?: () => void
  onCancel?: () => void
}

function toDefaultValues(product?: Product | null): ProductSchema {
  return {
    name: product?.name ?? '',
    price: product ? String(product.price) : '',
    stock: product ? String(product.stock ?? 0) : '0',
    categoryId: product?.categoryId ?? '',
    channelId: product?.channelId ?? '',
    description: product?.description ?? '',
    materialInfo: product?.materialInfo ?? '',
    sizeGuideUrl: product?.sizeGuideUrl ?? '',
    shopeeLink: product?.shopeeLink ?? '',
  }
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const queryClient = useQueryClient()
  const { isSuperAdmin } = useAuthStore()
  const canSelectChannel = isSuperAdmin()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues: toDefaultValues(product),
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
  })

  const channelsQuery = useQuery({
    queryKey: ['channels'],
    queryFn: channelsApi.list,
    enabled: canSelectChannel,
  })

  useEffect(() => {
    reset(toDefaultValues(product))
  }, [product, reset])

  const createMutation = useMutation({
    mutationFn: productsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Tạo sản phẩm thành công')
      onSuccess?.()
    },
    onError: () => {
      toast.error('Không thể tạo sản phẩm. Vui lòng thử lại.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProductPayload> }) =>
      productsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Cập nhật sản phẩm thành công')
      onSuccess?.()
    },
    onError: () => {
      toast.error('Không thể cập nhật sản phẩm. Vui lòng thử lại.')
    },
  })

  const isEditing = Boolean(product)
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const onSubmit = (data: ProductSchema) => {
    if (canSelectChannel && !data.channelId) {
      toast.error('Vui lòng chọn Channel (Super Admin)')
      return
    }

    const payload: ProductPayload = {
      name: data.name.trim(),
      price: Number(data.price),
      stock: Number(data.stock) || 0,
      categoryId: data.categoryId,
      channelId: canSelectChannel ? data.channelId : undefined,
      description: data.description?.trim() || undefined,
      materialInfo: data.materialInfo?.trim() || undefined,
      sizeGuideUrl: data.sizeGuideUrl?.trim() || undefined,
      shopeeLink: data.shopeeLink?.trim() || undefined,
    }

    if (isEditing && product) {
      updateMutation.mutate({ id: product.id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const currentPrice = watch('price')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className={canSelectChannel ? 'md:col-span-2' : ''}>
          <label className="mb-1 block text-xs font-medium text-brand-black">Tên sản phẩm</label>
          <input
            {...register('name')}
            className={`form-input ${errors.name ? 'border-red-500' : ''}`}
            placeholder="Áo thun cổ tròn"
            disabled={isSubmitting}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {canSelectChannel && (
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-black">Channel (Super Admin)</label>
            <select
              {...register('channelId')}
              className="form-input"
              disabled={isSubmitting || channelsQuery.isLoading}
            >
              <option value="">Chọn channel</option>
              {(channelsQuery.data ?? []).map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Danh mục</label>
          <select
            {...register('categoryId')}
            className={`form-input ${errors.categoryId ? 'border-red-500' : ''}`}
            disabled={isSubmitting || categoriesQuery.isLoading}
          >
            <option value="">Chọn danh mục</option>
            {(categoriesQuery.data ?? []).map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Giá (VND)</label>
          <input
            {...register('price')}
            className={`form-input ${errors.price ? 'border-red-500' : ''}`}
            type="number"
            min={0}
            disabled={isSubmitting}
          />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Tồn kho ban đầu</label>
          <input
            {...register('stock')}
            className={`form-input ${errors.stock ? 'border-red-500' : ''}`}
            type="number"
            min={0}
            disabled={isSubmitting}
          />
          {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-brand-black">Mô tả</label>
        <textarea
          {...register('description')}
          className="form-input min-h-24"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Material info</label>
          <input {...register('materialInfo')} className="form-input" disabled={isSubmitting} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Size guide URL</label>
          <input {...register('sizeGuideUrl')} className="form-input" disabled={isSubmitting} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-black">Shopee link</label>
          <input {...register('shopeeLink')} className="form-input" disabled={isSubmitting} />
        </div>
      </div>

      {isEditing && product && (
        <div className="rounded-xl border border-brand-border bg-brand-gray/30 p-4">
          <VariantMatrix
            productId={product.id}
            productPrice={Number(currentPrice) || Number(product.price) || 0}
          />
        </div>
      )}

      {!isEditing && (
        <div className="rounded-xl border border-dashed border-brand-border bg-brand-gray/30 p-4 text-xs text-brand-muted">
          Variants được quản lý sau khi tạo sản phẩm xong.
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="btn-outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
          Hủy
        </button>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} />
          ) : (
            <Save className="h-4 w-4" strokeWidth={1.8} />
          )}
          {isEditing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
        </button>
      </div>
    </form>
  )
}
