import { Link } from 'react-router-dom'
import { Globe, MessageCircle, AtSign, Phone, ShieldCheck, Code2 } from 'lucide-react'
import { InstagramIcon, FacebookIcon } from '@/components/ui/BrandIcons'
import { Logo } from '@/components/ui/Logo'
import { APP_NAME, DEFAULT_DEVELOPER } from '@/constants'

const links = [
  { label: 'الرئيسية', to: '/' },
  { label: 'الأطباء', to: '/doctors' },
  { label: 'العيادات', to: '/clinics' },
  { label: 'المشافي', to: '/hospitals' },
  { label: 'الصيدليات', to: '/pharmacies' },
  { label: 'الصيدليات المناوبة', to: '/duty-pharmacies' },
  { label: 'النصائح الطبية', to: '/articles' },
  { label: 'اسأل دليلك الطبي', to: '/ask' },
  { label: 'باقات الاشتراك', to: '/plans' },
]

const legal = [
  { label: 'من نحن', to: '/about' },
  { label: 'تواصل معنا', to: '/contact' },
  { label: 'سياسة الخصوصية', to: '/privacy' },
  { label: 'شروط الاستخدام', to: '/terms' },
  { label: 'إخلاء المسؤولية الطبية', to: '/disclaimer' },
  { label: 'سياسة المحتوى الطبي', to: '/medical-policy' },
]

export function Footer({ developer = DEFAULT_DEVELOPER }: { developer?: (typeof DEFAULT_DEVELOPER) }) {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo />
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
              <span dir="ltr">{developer.phone}</span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              {developer.instagram && (
                <a
                  href={developer.instagram}
                  target="_blank" rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-primary hover:text-primary"
                  aria-label="إنستغرام"
                >
                  <InstagramIcon className="size-4.5" />
                </a>
              )}
              {developer.facebook && (
                <a
                  href={developer.facebook}
                  target="_blank" rel="noopener noreferrer"
                  className="flex size-10 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-primary hover:text-primary"
                  aria-label="فيسبوك"
                >
                  <FacebookIcon className="size-4.5" />
                </a>
              )}
              {developer.international_phone && (
                <a
                  href={`tel:${developer.international_phone}`}
                  className="flex size-10 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-primary hover:text-primary"
                  aria-label="اتصال"
                >
                  <Globe className="size-4.5" />
                </a>
              )}
              <a
                href={`https://wa.me/963${developer.phone?.replace(/^0/, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-primary hover:text-primary"
                aria-label="واتساب"
              >
                <MessageCircle className="size-4.5" />
              </a>
              <a
                href={`mailto:support@dalil-altaybeh.com`}
                className="flex size-10 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-primary hover:text-primary"
                aria-label="بريد"
              >
                <AtSign className="size-4.5" />
              </a>
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-muted">
              <ShieldCheck className="size-5 shrink-0 text-primary" />
              يهدف هذا الدليل للتثقيف ولا يُغني عن استشارة الطبيب المختص.
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {APP_NAME} — جميع الحقوق محفوظة</p>
          <p className="flex items-center gap-1.5">
            <Code2 className="size-3.5 text-primary" />
            تطوير {developer.name} — <a href={`tel:${developer.phone}`} className="text-primary hover:underline" dir="ltr">{developer.phone}</a>
          </p>
        </div>
      </div>
    </footer>
  )
}