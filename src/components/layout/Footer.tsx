import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, MessageCircle, AtSign, Phone, ShieldCheck, Code2, BellRing, BellOff } from 'lucide-react'
import { InstagramIcon, FacebookIcon } from '@/components/ui/BrandIcons'
import { Logo } from '@/components/ui/Logo'
import { APP_NAME, DEFAULT_DEVELOPER, FEATURE_CLINICS } from '@/constants'
import { subscribePush, pushSupported } from '@/services/push'

const links = [
  { label: 'الرئيسية', to: '/' },
  { label: 'الأطباء', to: '/doctors' },
  { label: 'العيادات', to: '/clinics' },
  { label: 'المشافي', to: '/hospitals' },
  { label: 'الصيدليات', to: '/pharmacies' },
  { label: 'الصيدليات المناوبة', to: '/duty-pharmacies' },
  { label: 'اسأل دليلك الطبي', to: '/ask' },
  { label: 'باقات الاشتراك', to: '/plans' },
  { label: 'ترقية حسابي', to: '/upgrade' },
].filter((l) => FEATURE_CLINICS || l.to !== '/clinics')

const legal = [
  { label: 'عن المنصة', to: '/about-platform' },
  { label: 'تواصل معنا', to: '/contact' },
  { label: 'سياسة الخصوصية', to: '/privacy' },
  { label: 'شروط الاستخدام', to: '/terms' },
  { label: 'إخلاء المسؤولية الطبية', to: '/disclaimer' },
  { label: 'سياسة المحتوى الطبي', to: '/medical-policy' },
]

export function Footer({ developer = DEFAULT_DEVELOPER }: { developer?: (typeof DEFAULT_DEVELOPER) }) {
  const [pushBusy, setPushBusy] = useState(false)
  const [pushOn, setPushOn] = useState(() => typeof Notification !== 'undefined' && Notification.permission === 'granted')
  const [pushMsg, setPushMsg] = useState('')

  const enablePush = async () => {
    setPushBusy(true)
    setPushMsg('')
    const r = await subscribePush({ news: true, dailyDuty: true })
    setPushBusy(false)
    if (r === 'ok') { setPushOn(true); setPushMsg('تم تفعيل الإشعارات بنجاح — ستصلك أخبار المنصة وصيدلية المناوبة كل صباح.') }
    else if (r === 'denied') setPushMsg('حظرت المتصفح الإشعارات — فعّلها من إعدادات الموقع في المتصفح.')
    else if (r === 'unsupported') setPushMsg('متصفحك لا يدعم الإشعارات — على آيفون أضف الموقع إلى الشاشة الرئيسية أولاً.')
    else setPushMsg('تعذر التفعيل، حاول مجدداً.')
  }

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
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-subtle px-4 py-3 text-xs text-muted">
              <ShieldCheck className="size-5 shrink-0 text-primary" />
              يهدف هذا الدليل للتثقيف ولا يُغني عن استشارة الطبيب المختص.
            </div>
          </div>
        </div>
        {/* بطاقة تفعيل الإشعارات */}
        {pushSupported() && (
          <div className="mt-10 flex flex-col items-start gap-4 rounded-[18px] border border-primary/20 bg-primary-light/30 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
                {pushOn ? <BellRing className="size-5" /> : <BellOff className="size-5" />}
              </span>
              <div>
                <p className="text-sm font-black text-ink">إشعارات {APP_NAME}</p>
                <p className="mt-0.5 text-xs leading-6 text-muted">
                  صيدلية المناوبة كل صباح، الجهات الجديدة، وتحديثات طلبات المواعيد — تصلك حتى وأنت خارج الموقع.
                </p>
                {pushMsg && <p className="mt-1 text-[11px] font-bold text-primary-dark">{pushMsg}</p>}
              </div>
            </div>
            <button
              onClick={() => void enablePush()}
              disabled={pushOn || pushBusy}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-primary-dark disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              <BellRing className="size-4" />
              {pushOn ? 'الإشعارات مفعّلة' : pushBusy ? 'جارٍ التفعيل…' : 'تفعيل الإشعارات'}
            </button>
          </div>
        )}

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