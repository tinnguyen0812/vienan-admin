import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Building2,
  LogOut,
  ChevronRight,
  Store,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface NavItem {
  to: string
  icon: React.ElementType
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',          icon: LayoutDashboard, label: 'Tổng quan'  },
  { to: '/products',  icon: Package,         label: 'Sản phẩm'   },
  { to: '/orders',    icon: ShoppingCart,    label: 'Đơn hàng'   },
  { to: '/categories',icon: Tag,             label: 'Danh mục'   },
]

const SUPER_ADMIN_ITEMS: NavItem[] = [
  { to: '/channels', icon: Building2, label: 'Channels' },
]

export function Sidebar() {
  const navigate  = useNavigate()
  const logout    = useAuthStore((s) => s.logout)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin())
  const navItems = isSuperAdmin ? [...NAV_ITEMS, ...SUPER_ADMIN_ITEMS] : NAV_ITEMS

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="
      fixed inset-y-0 left-0 z-30
      flex w-60 flex-col
      bg-brand-black
      select-none
    ">
      {/* ── Brand ─────────────────────────────────────────── */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <Store className="h-4 w-4 text-white" strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-white">Viên An</p>
          <p className="mt-0.5 text-[10px] leading-none text-white/40 uppercase tracking-wider">
            Admin Dashboard
          </p>
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────────── */}
      <div className="mx-4 h-px bg-white/[0.06]" />

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Menu
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
               transition-all duration-150
               ${isActive
                 ? 'bg-white text-brand-black'
                 : 'text-white/60 hover:bg-white/10 hover:text-white'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-brand-black' : 'text-white/50 group-hover:text-white'}`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <ChevronRight className="h-3.5 w-3.5 text-brand-muted" strokeWidth={2} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────── */}
      <div className="mx-4 h-px bg-white/[0.06]" />
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="
            flex w-full items-center gap-3 rounded-lg px-3 py-2.5
            text-sm font-medium text-white/50
            transition-all duration-150
            hover:bg-red-500/10 hover:text-red-400
          "
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
