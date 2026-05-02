import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { ProtectedRoute } from '@/router/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import LoginPage        from '@/pages/Login'
import DashboardPage    from '@/pages/Dashboard'
import ProductListPage  from '@/pages/products/ProductList'
import ProductEditPage  from '@/pages/products/ProductEdit'
import OrderListPage    from '@/pages/orders/OrderList'
import OrderDetailPage  from '@/pages/orders/OrderDetail'
import CategoryListPage from '@/pages/categories/CategoryList'
import ChannelListPage  from '@/pages/channels/ChannelList'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors closeButton />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected – wrapped in MainLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index             element={<DashboardPage />}    />
            <Route path="products"   element={<ProductListPage />}  />
            <Route path="products/:id/edit" element={<ProductEditPage />} />
            <Route path="orders"     element={<OrderListPage />}    />
            <Route path="orders/:id" element={<OrderDetailPage />}  />
            <Route path="categories" element={<CategoryListPage />} />
            <Route path="channels"   element={<ChannelListPage />}  />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
