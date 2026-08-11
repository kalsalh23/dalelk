import { Link } from 'react-router-dom'
import { Globe, MessageCircle, AtSign, Phone, HeartPulse, ShieldCheck } from 'lucide-react'
import { APP_NAME } from '@/constants'

const links = [
  { label: 'الرئيسية', to: '/' },
  { label: 'الأطباء', to: '/doctors' },
  { label: 'العيادات', to: '/clinics' },
  { label: 'المشافي', to: '/hospitals' },
  { label: 'الصيدليات', to: '/pharmacies' },
  { label: 'الصيدليات المناوبة', to: '/duty-pharmacies' },
  { label: 'النصائح الطبية', to: '/articles' },
  { label: 'اسأل دليلك الطبي', to: '/ask' },
]

const legal = [
  { label: 'تواصل معنا', to: '/contact' },
  { label: 'سياسة الخصوصية', to: '/privacy' },
  { label: 'شروط الاستخدام', to: '/terms' },
  { label: 'إخلاء المسؤولية الطبية', to: '/disclaimer' },
  { label: 'سياسة المحتوى الطبي', to: '/medical-policy' },
]

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-white">
                <HeartPulse className="size-6" />
              </div>
              <p className="text-lg font-black text-ink">{APP_NAME}</p>
            </div>
            <p className="text-sm leading-7 text-muted">
              دليل الخدمات الطبية في مدينة طيبة الإمام. كل ما تحتاجه من خدمات صحية في مكان واحد.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-black text-ink">الأقسام</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-muted">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-black text-ink">روابط قانونية</h4>
            <ul className="space-y-2 text-sm text-muted">
              {legal.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-black text-ink">تواصل معنا</h4>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Phone className="size-4 text-primary" />
              <span dir="ltr">+963 933 000 000</span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              {[Globe, AtSign, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex size-10 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="size-4.5" />
                </a>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-muted">
              <ShieldCheck className="size-5 shrink-0 text-primary" />
              يهدف هذا الدليل للتثقيف ولا يُغني عن استشارة الطبيب المختص.
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {APP_NAME} — جميع الحقوق محفوظة</p>
          <p>طيبة الإمام، سوريا</p>
        </div>
      </div>
    </footer>
  )
}