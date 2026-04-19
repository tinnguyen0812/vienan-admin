import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

/**
 * MainLayout wraps all authenticated pages.
 * Structure:
 *  ┌─────────────────────────────────┐
 *  │  Sidebar (fixed, 240px)         │
 *  │  ┌───────────────────────────┐  │
 *  │  │  Header  (sticky top)     │  │
 *  │  ├───────────────────────────┤  │
 *  │  │  <Outlet /> – page body   │  │
 *  │  └───────────────────────────┘  │
 *  └─────────────────────────────────┘
 */
export function MainLayout() {
  return (
    <div className="flex min-h-dvh bg-brand-gray">
      <Sidebar />

      {/* Content area – offset by sidebar width */}
      <div className="flex flex-1 flex-col pl-60">
        <Header />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
