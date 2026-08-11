import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn } from '@/services/admin'
import { useAdminAuth } from '@/features/admin/auth'
import { APP_NAME } from '@/constants'

export function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { profile, refresh } = useAdminAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile?.is_admin) navigate('/admin', { replace: true })
  }, [profile, navigate])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('بيانات الدخول غير صحيحة أو لا يملك الحساب صلاحية إدارية.')
      return
    }
    await refresh()
    navigate('/admin', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-l from-primary-light/40 to-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-3xl bg-primary text-white shadow-lg shadow-primary/25">
            <ShieldCheck className="size-8" />
          </div>
          <h1 className="text-xl font-black text-ink">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted">تسجيل الدخول إلى لوحة الإدارة</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-ink">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-surface pr-11 pl-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                placeholder="admin@daliq-el-tibb.sy"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-ink">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" />
              <input
                type={show ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-surface pl-11 pr-11 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShow((v) => !v)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink cursor-pointer">
                {show ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
              </button>
            </div>
          </div>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-60 cursor-pointer"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            تسجيل الدخول
          </button>
          <p className="text-center text-[11px] leading-5 text-muted">تتم إدارة صلاحيات الدخول من مسؤول النظام عبر Supabase Auth.</p>
        </form>
      </div>
    </div>
  )
}