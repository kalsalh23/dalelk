import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, ShieldCheck, AlertTriangle } from 'lucide-react'
import { buildEntityEmail, entityLogin, fetchEntitySession, magicLogin, readStoredSession } from '@/services/entityAccount'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { Seo } from '@/components/seo/Seo'
import { useParams } from 'react-router-dom'

export function DashboardLoginPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [autoEmail] = useState(() => slug ? buildEntityEmail(slug) : '')
  const [email, setEmail] = useState(autoEmail)
  const [pass, setPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [bad, setBad] = useState(false)

  useEffect(() => {
    const stored = readStoredSession()
    if (stored) {
      void fetchEntitySession(stored.token).then((d) => { if (d) navigate('/dashboard', { replace: true }) })
    }
  }, [navigate])

  useEffect(() => {
    const tk = searchParams.get('tk')
    if (!tk) return
    setSearchParams((p) => { const q = new URLSearchParams(p); q.delete('tk'); return q }, { replace: true })
    void magicLogin(tk).then((s) => {
      if (!s) { toast.show('رابط الدخول غير صالح أو منتهي', 'error'); return }
      toast.show('تم تسجيل الدخول بنجاح')
      navigate('/dashboard', { replace: true })
    })
  }, [searchParams, setSearchParams, toast, navigate])

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !pass) { toast.show('أدخل البريد وكلمة السر', 'error'); return }
    setLoading(true); setBad(false)
    const s = await entityLogin(email, pass)
    setLoading(false)
    if (!s) { setBad(true); toast.show('بيانات الدخول غير صحيحة', 'error'); return }
    toast.show('تم تسجيل الدخول')
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Seo title="دخول لوحة التحكم" description="دخول الجهات إلى لوحة التحكم الخاصة بهم" />
      <Card className="w-full max-w-md">
        <CardBody className="py-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-3xl bg-primary text-white">
              <ShieldCheck className="size-7" />
            </div>
            <h1 className="text-xl font-black text-ink">دخول لوحة التحكم</h1>
            <p className="mt-1 text-sm leading-6 text-muted">أدخل البريد وكلمة السر التي استلمتها من الإدارة بعد الموافقة.</p>
          </div>
          <form onSubmit={(e) => void doLogin(e)} className="space-y-4">
            <Field label="البريد الإلكتروني">
              <Input dir="ltr" placeholder={autoEmail || 'admin-...@gmail.com'} value={email} onChange={(e) => { setEmail(e.target.value); setBad(false) }} />
            </Field>
            <Field label="كلمة السر">
              <Input dir="ltr" type="password" placeholder="كلمة السر" value={pass} onChange={(e) => { setPass(e.target.value); setBad(false) }} />
            </Field>
            {bad && <p className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-error"><AlertTriangle className="size-4" /> بيانات الدخول غير صحيحة</p>}
            <Button type="submit" loading={loading} className="w-full"><KeyRound className="size-4" /> دخول</Button>
          </form>
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-xs leading-6 text-muted">
            <p className="font-bold text-amber-700">كيف أحصل على بيانات الدخول؟</p>
            <p className="mt-1">بعد تقديم طلب ترقية من صفحة <Link to="/plans" className="font-bold text-primary hover:underline">الباقات</Link> وموافقة الإدارة، سيصلك بريد وكلمة سر ورابط دخول مباشر خاص بك.</p>
          </div>
          <p className="mt-4 text-center text-xs text-muted"><Link to="/" className="hover:underline">العودة للرئيسية</Link> · <Link to="/account" className="hover:underline">لوحة الحساب القديمة</Link></p>
        </CardBody>
      </Card>
    </div>
  )
}
