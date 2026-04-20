// ─── Shared ──────────────────────────────────────────────────────────────────

export type UUID = string

export interface TimestampedEntity {
  id: UUID
  created_at: string
  updated_at: string
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: UUID
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface CategoryPayload {
  name: string
  slug?: string
  description?: string
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductSize = 'S' | 'M' | 'L' | 'XL'

export interface ProductVariant {
  color: string
  size: ProductSize
  stock: number
}

export interface ProductImage {
  id: UUID
  url: string
  alt?: string
  display_order: number
}

export interface Product {
  id: UUID
  name: string
  slug?: string | null
  price: string
  originalPrice: string | null
  images: string[]
  description?: string | null
  materialInfo?: string | null
  fabricWeight?: number | null
  sizeGuideUrl?: string | null
  shopeeLink?: string | null
  sizes?: string[] | null
  colors?: string[] | null
  tags?: string[] | null
  stock: number
  soldCount: number
  isActive: boolean
  categoryId: UUID
  category?: Category
  channelId: UUID
  createdAt: string
  updatedAt: string
  variants?: ProductVariant[]
  thumbnail?: string
}

export interface ProductPayload {
  name: string
  price: number
  description?: string
  materialInfo?: string
  sizeGuideUrl?: string
  shopeeLink?: string
  categoryId: UUID
  variants: ProductVariant[]
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'shipping' | 'delivered' | 'cancelled'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   'Chờ xử lý',
  shipping:  'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   'bg-amber-100   text-amber-700',
  shipping:  'bg-blue-100    text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100     text-red-700',
}

export interface OrderItem {
  id: UUID
  product_id: UUID
  product_name: string
  product_thumbnail?: string
  variant_id?: UUID
  variant_sku?: string
  sku?: string
  color: string
  size: ProductSize
  quantity: number
  unit_price: number
}

export interface OrderAddress {
  fullAddress: string   // assembled full address
  street?: string
  ward?: string         // Phường/Xã
  district?: string     // Quận/Huyện
  city?: string         // Tỉnh/TP
}

export interface Order extends TimestampedEntity {
  order_code: string
  status: OrderStatus
  total_amount: number  // VND
  note?: string
  payment_proof_url?: string
  // Customer
  customer_name: string
  customer_phone: string
  shipping_address: OrderAddress
  // Items
  items: OrderItem[]
}

export interface OrderStatusUpdatePayload {
  status: OrderStatus
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN'

export interface User {
  id: number
  email: string
  role: UserRole
  channelId: number | null
}

export interface Channel extends TimestampedEntity {
  name: string
  code: string
  isActive: boolean
}

export interface ChannelPayload {
  name: string
  code: string
}

export interface ChannelApiKey extends TimestampedEntity {
  keyPrefix: string
  channelId: string
  revokedAt: string | null
}

// ─── API Pagination ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}
