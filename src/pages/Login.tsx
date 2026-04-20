import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, Zap } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/data-models'

// ─── Quick-fill credentials (UAT) ───────────────────────────────────────────
const QUICK_EMAIL    = 'admin@vienan.com'
const QUICK_PASSWORD = 'Admin@123'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  // ─── Mutation ──────────────────────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user ?? null)
      navigate('/', { replace: true })
    },
  })

  // ─── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errors: typeof fieldErrors = {}
    if (!email.trim()) errors.email = 'Vui lòng nhập email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Email không hợp lệ.'
    if (!password) errors.password = 'Vui lòng nhập mật khẩu.'
    else if (password.length < 6) errors.password = 'Mật khẩu tối thiểu 6 ký tự.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // ─── Quick-fill ────────────────────────────────────────────────────────────
  function fillMock() {
    setEmail(QUICK_EMAIL)
    setPassword(QUICK_PASSWORD)
    setFieldErrors({})
    loginMutation.reset()
  }


  // ─── Submit ────────────────────────────────────────────────────────────────
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    loginMutation.mutate({ email: email.trim(), password })
  }

  // ─── API error message ────────────────────────────────────────────────────
  const apiError = loginMutation.isError
    ? 'Email hoặc mật khẩu không chính xác.'
    : null

  return (
    <div className="flex min-h-dvh items-center justify-center bg-brand-gray px-4">
      {/* Card */}
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-black">
            <ShieldCheck className="h-6 w-6 text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-brand-black">
            Viên An Admin
          </h1>
          <p className="mt-1 text-xs text-brand-muted">
            Đăng nhập để quản lý cửa hàng
          </p>
        </div>

        {/* Form card */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-brand-black" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <Mail className="h-4 w-4 text-brand-muted" strokeWidth={1.8} />
                </span>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`form-input pl-9 ${fieldErrors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
                  placeholder="admin@vianan.vn"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  disabled={loginMutation.isPending}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-brand-black" htmlFor="password">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <Lock className="h-4 w-4 text-brand-muted" strokeWidth={1.8} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-input pl-9 pr-10 ${fieldErrors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10' : ''}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setFieldErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-brand-muted transition-colors hover:text-brand-black"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" strokeWidth={1.8} />
                    : <Eye   className="h-4 w-4" strokeWidth={1.8} />
                  }
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* API error */}
            {apiError && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-600 border border-red-100">
                {apiError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full mt-2"
            >
              {loginMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-brand-muted">
          © {new Date().getFullYear()} Viên An — Internal Admin
        </p>

        {/* ── Dev mock hint ─────────────────────────────────────── */}
        <div className="mt-4 rounded-xl border border-dashed border-amber-300 bg-amber-50/80 px-4 py-3">
          <div className="flex items-start gap-2.5">
            <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-amber-700">Tài khoản UAT</p>
              <p className="mt-0.5 text-[11px] text-amber-600 font-mono break-all">
                {QUICK_EMAIL} / {QUICK_PASSWORD}
              </p>
            </div>
            <button
              type="button"
              onClick={fillMock}
              className="shrink-0 rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700
                         transition-colors hover:bg-amber-200 active:scale-95"
            >
              Điền nhanh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
