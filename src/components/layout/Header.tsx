import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
  '/':           'Tổng quan',
  '/products':   'Quản lý sản phẩm',
  '/orders':     'Quản lý đơn hàng',
  '/categories': 'Quản lý danh mục',
  '/channels':   'Quản lý channels',
}

function usePageTitle(): string {
  const { pathname } = useLocation()
  // Match exact or the first segment (e.g. /products/new → "Quản lý sản phẩm")
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const segment = '/' + pathname.split('/')[1]
  return PAGE_TITLES[segment] ?? 'Admin'
}

export function Header() {
  const title = usePageTitle()

  return (
    <header className="
      sticky top-0 z-20
      flex h-16 items-center justify-between
      border-b border-brand-border
      bg-white/80 backdrop-blur-md
      px-6
    ">
      {/* Left – page title */}
      <h2 className="text-base font-semibold text-brand-black">{title}</h2>

      {/* Right – actions */}
      <div className="flex items-center gap-2">
        {/* Search trigger (cosmetic for now) */}
        <button
          className="
            flex h-8 w-8 items-center justify-center
            rounded-lg text-brand-muted
            transition-colors hover:bg-brand-gray hover:text-brand-black
          "
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4" strokeWidth={1.8} />
        </button>

        {/* Notification bell */}
        <button
          className="
            relative flex h-8 w-8 items-center justify-center
            rounded-lg text-brand-muted
            transition-colors hover:bg-brand-gray hover:text-brand-black
          "
          aria-label="Thông báo"
        >
          <Bell className="h-4 w-4" strokeWidth={1.8} />
          {/* Dot indicator */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Avatar */}
        <div className="
          ml-1 flex h-8 w-8 items-center justify-center
          rounded-full bg-brand-black
          text-[11px] font-semibold text-white
          cursor-default select-none
        ">
          VA
        </div>
      </div>
    </header>
  )
}
