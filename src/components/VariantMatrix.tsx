import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import { variantsApi } from '@/api/variants'

const SIZE_ORDER = ['S', 'M', 'L', 'XL', '2XL', '3XL'] as const

const PRESET_COLORS = [
  { name: 'Đen', code: '#1a1a1a' },
  { name: 'Trắng', code: '#f8f8f8' },
  { name: 'Xám', code: '#9e9e9e' },
  { name: 'Xanh Navy', code: '#1b2a4a' },
  { name: 'Kem', code: '#f5f0e8' },
  { name: 'Xanh Rêu', code: '#4a5e3a' },
  { name: 'Be', code: '#e8dcc8' },
  { name: 'Nâu', code: '#795548' },
]

interface Props {
  productId: string
  productPrice: number
}

function variantKey(color: string, size: string) {
  return `${color}|${size}`
}

export function VariantMatrix({ productId, productPrice }: Props) {
  const queryClient = useQueryClient()
  const [selectedColors, setSelectedColors] = useState<string[]>(['Đen', 'Trắng'])
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL'])
  const [stockMap, setStockMap] = useState<Record<string, number>>({})
  const [skuMap, setSkuMap] = useState<Record<string, string>>({})
  const [colorImageMap, setColorImageMap] = useState<Record<string, string>>({})

  const [bulkStock, setBulkStock] = useState<number>(0)
  const [bulkSku, setBulkSku] = useState<string>('')

  const variantsQuery = useQuery({
    queryKey: ['variants', productId],
    queryFn: () => variantsApi.list(productId),
    enabled: Boolean(productId),
  })

  const variants = variantsQuery.data ?? []

  const handleBulkApply = () => {
    const nextStockMap = { ...stockMap }
    const nextSkuMap = { ...skuMap }

    for (const key of desiredKeys) {
      const [color, size] = key.split('|')
      if (bulkStock > 0) {
        nextStockMap[key] = bulkStock
      }
      if (bulkSku.trim()) {
        const colorShort = color.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3).toUpperCase()
        nextSkuMap[key] = `${bulkSku.trim().toUpperCase()}-${colorShort}-${size}`
      }
    }

    setStockMap(nextStockMap)
    setSkuMap(nextSkuMap)
  }

  useEffect(() => {
    const nextStockMap: Record<string, number> = {}
    const nextSkuMap: Record<string, string> = {}
    const nextColorImageMap: Record<string, string> = {}
    const colors = new Set<string>()
    const sizes = new Set<string>()

    for (const variant of variants) {
      const key = variantKey(variant.color, variant.size)
      nextStockMap[key] = variant.stock
      nextSkuMap[key] = variant.sku
      if (variant.imageUrl && !nextColorImageMap[variant.color]) {
        nextColorImageMap[variant.color] = variant.imageUrl
      }
      colors.add(variant.color)
      sizes.add(variant.size)
    }

    if (colors.size > 0) {
      setSelectedColors([...colors])
    }
    if (sizes.size > 0) {
      setSelectedSizes(SIZE_ORDER.filter((size) => sizes.has(size)))
    }

    setStockMap(nextStockMap)
    setSkuMap(nextSkuMap)
    setColorImageMap(nextColorImageMap)
  }, [variants])

  const desiredKeys = useMemo(() => {
    const keys: string[] = []
    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        keys.push(variantKey(color, size))
      }
    }
    return keys
  }, [selectedColors, selectedSizes])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const presetByName = new Map(PRESET_COLORS.map((color) => [color.name, color.code]))
      const existingByKey = new Map(variants.map((variant) => [variantKey(variant.color, variant.size), variant]))
      const desiredKeySet = new Set(desiredKeys)

      const createPayload: Array<{
        color: string
        colorCode: string | null
        size: string
        sku: string
        stock: number
        imageUrl: string | null
        isActive: boolean
      }> = []

      for (const key of desiredKeys) {
        const [color, size] = key.split('|')
        const existing = existingByKey.get(key)
        const colorCode = presetByName.get(color) ?? null
        const sku = skuMap[key] || `${color.slice(0, 3).toUpperCase()}-${size}`
        const stock = Number(stockMap[key] ?? 0)
        const imageUrl = colorImageMap[color] || null

        if (existing) {
          await variantsApi.update(productId, existing.id, {
            color,
            colorCode,
            size,
            sku,
            stock,
            imageUrl,
            isActive: stock > 0,
          })
        } else {
          createPayload.push({
            color,
            colorCode,
            size,
            sku,
            stock,
            imageUrl,
            isActive: stock > 0,
          })
        }
      }

      const removedVariants = variants.filter((variant) => !desiredKeySet.has(variantKey(variant.color, variant.size)))
      for (const removedVariant of removedVariants) {
        await variantsApi.delete(productId, removedVariant.id)
      }

      if (createPayload.length > 0) {
        await variantsApi.bulkCreate(productId, createPayload)
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['variants', productId] })
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-brand-black">Variant Matrix</p>
        <p className="mt-1 text-xs text-brand-muted">Quản lý stock, SKU, màu và size cho từng biến thể.</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">Màu sắc</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => {
            const active = selectedColors.includes(color.name)
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => {
                  setSelectedColors((current) =>
                    current.includes(color.name)
                      ? current.filter((item) => item !== color.name)
                      : [...current, color.name],
                  )
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  active ? 'border-brand-black bg-brand-black text-white' : 'border-brand-border bg-white text-brand-black hover:bg-brand-gray'
                }`}
              >
                <span className="h-3 w-3 rounded-full border border-white/40" style={{ backgroundColor: color.code }} />
                {color.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">Size</p>
        <div className="flex flex-wrap gap-2">
          {SIZE_ORDER.map((size) => {
            const active = selectedSizes.includes(size)
            return (
              <button
                key={size}
                type="button"
                onClick={() => {
                  setSelectedSizes((current) =>
                    current.includes(size)
                      ? current.filter((item) => item !== size)
                      : [...current, size],
                  )
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active ? 'border-brand-black bg-brand-black text-white' : 'border-brand-border bg-white text-brand-black hover:bg-brand-gray'
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-brand-border bg-brand-gray/10 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase text-brand-muted">Default Stock</label>
            <input
              type="number"
              className="form-input h-9 w-24 px-3 text-sm"
              placeholder="0"
              value={bulkStock}
              onChange={(e) => setBulkStock(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase text-brand-muted">Base SKU</label>
            <input
              type="text"
              className="form-input h-9 w-40 px-3 text-sm uppercase"
              placeholder="e.g. POLO-01"
              value={bulkSku}
              onChange={(e) => setBulkSku(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={handleBulkApply}
            className="h-9 rounded-lg bg-brand-black px-4 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            disabled={!bulkSku.trim() && bulkStock <= 0}
          >
            Áp dụng cho tất cả
          </button>
          <p className="pb-2 text-[10px] text-brand-muted italic">
            * Sẽ áp dụng cho các ô đang được chọn (On)
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-brand-border bg-white">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-brand-gray/60 text-brand-muted">
              <th className="min-w-[160px] border-b border-brand-border px-3 py-2 text-left">Màu / Size</th>
              {SIZE_ORDER.map((size) => (
                <th key={size} className="border-b border-brand-border px-3 py-2 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span>{size}</span>
                    <span className={`rounded-full px-2 py-0.5 ${selectedSizes.includes(size) ? 'bg-brand-black text-white' : 'bg-brand-gray text-brand-muted'}`}>
                      {selectedSizes.includes(size) ? 'On' : 'Off'}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedColors.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-brand-muted" colSpan={SIZE_ORDER.length + 1}>
                  Chọn ít nhất một màu để bắt đầu.
                </td>
              </tr>
            ) : (
              selectedColors.map((color) => {
                const colorDef = PRESET_COLORS.find((item) => item.name === color)
                return (
                  <tr key={color} className="align-top">
                    <td className="border-b border-brand-border px-3 py-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full border border-brand-border" style={{ backgroundColor: colorDef?.code ?? '#ccc' }} />
                          <span className="font-medium text-brand-black">{color}</span>
                        </div>
                        <div className="group relative">
                          {colorImageMap[color] ? (
                            <div className="relative h-12 w-12 overflow-hidden rounded border border-brand-border">
                              <img src={colorImageMap[color]} alt={color} className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setColorImageMap((prev) => ({ ...prev, [color]: '' }))}
                                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <span className="text-[10px] text-white">Xóa</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded border border-dashed border-brand-border bg-brand-gray/20 text-brand-muted">
                              <span className="text-[10px]">No img</span>
                            </div>
                          )}
                        </div>
                        <input
                          type="text"
                          className="form-input h-7 px-2 py-1 text-[10px]"
                          placeholder="Image URL..."
                          value={colorImageMap[color] ?? ''}
                          onChange={(e) => setColorImageMap((prev) => ({ ...prev, [color]: e.target.value }))}
                        />
                      </div>
                    </td>
                    {SIZE_ORDER.map((size) => {
                      const key = variantKey(color, size)
                      const enabled = selectedSizes.includes(size)
                      return (
                        <td key={key} className={`border-b border-brand-border px-2 py-2 ${enabled ? 'bg-white' : 'bg-brand-gray/40'}`}>
                          {enabled ? (
                            <div className="space-y-2">
                              <input
                                type="number"
                                min={0}
                                className="form-input h-8 px-2 py-1 text-xs"
                                value={stockMap[key] ?? 0}
                                onChange={(event) => {
                                  const nextValue = Number(event.target.value)
                                  setStockMap((current) => ({ ...current, [key]: Number.isNaN(nextValue) ? 0 : nextValue }))
                                }}
                                placeholder="Stock"
                              />
                              <input
                                type="text"
                                className="form-input h-8 px-2 py-1 text-xs uppercase"
                                value={skuMap[key] ?? ''}
                                onChange={(event) => {
                                  setSkuMap((current) => ({ ...current, [key]: event.target.value }))
                                }}
                                placeholder="SKU"
                              />
                            </div>
                          ) : (
                            <div className="flex h-[68px] items-center justify-center text-brand-border">—</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-brand-muted">
          Giá tham chiếu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(productPrice)}
        </p>
        <button className="btn-primary" type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || variantsQuery.isLoading}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.8} /> : <Save className="h-4 w-4" strokeWidth={1.8} />}
          Lưu variants
        </button>
      </div>

      {variants.length > 0 && (
        <div className="rounded-xl border border-brand-border bg-brand-gray/20 p-3 text-xs text-brand-muted">
          Đã có {variants.length} variants trong hệ thống. Thay đổi ở đây sẽ đồng bộ theo matrix.
        </div>
      )}
    </div>
  )
}
