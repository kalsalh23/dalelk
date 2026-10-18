import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, AtSign, Phone, ShieldCheck, Code2, BellRing, BellOff } from 'lucide-react'
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
  { label: 'اسأل دليلك', to: '/ask' },
].filter((l) => FEATURE_CLINICS || l.to !== '/clinics')

export function Footer({ developer = DEFAULT_DEVELOPER }: { developer?: (typeof DEFAULT_DEVELOPER) }) {
  const [pushBusy, setPushBusy] = useState(false)
  const [pushOn, setPushOn] = useState(() => typeof Notification !== 'undefined' && Notification.permission === 'granted')
  const [pushMsg, setPushMsg] = useState('')

  const enablePush = async () => {
    setPushBusy(true)
    setPushMsg('')
    const r = await subscribePush({ news: true, dailyDuty: true })
    setPushBusy(false)
    if (r === 'ok') { setPushOn(true); setPushMsg('تم تفعيل الإشعارات بنجاح — ستصلك أخبار المنصة وتذكير صيدليات المناوبة 3 مرات يومياً (كل 8 ساعات).') }
    else if (r === 'denied') setPushMsg('حظرت المتصفح الإشعارات — فعّلها من إعدادات الموقع في المتصفح.')
    else if (r === 'unsupported') setPushMsg('متصفحك لا يدعم الإشعارات — على آيفون أضف الموقع إلى الشاشة الرئيسية أولاً.')
    else setPushMsg('تعذر التفعيل، حاول مجدداً.')
  }

  const headCls = 'mb-2.5 text-xs font-black tracking-wide text-emerald-300'
  const linkCls = 'transition-colors hover:text-white'
  const socialCls = 'flex size-8 items-center justify-center rounded-lg border border-white/15 text-white/60 transition-colors hover:border-white/50 hover:text-white'

  return (
    <footer className="mt-10 bg-primary-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <Logo inverse />
            <p className="mt-2.5 max-w-xs text-xs leading-6 text-white/55">
              دليل الخدمات الطبية في مدينة طيبة الإمام — كل ما تحتاجه من خدمات صحية في مكان واحد.
            </p>
          </div>

          <div>
            <h4 className={headCls}>الأقسام</h4>
            <ul className="grid grid-cols-2 gap-1.5 text-[13px] text-white/70">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={headCls}>تواصل معنا</h4>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/70">
              <Phone className="size-3.5 shrink-0 text-emerald-300" />
              <span>مطوّر المنصة: م. قصي مهند الصالح</span>
              <a
                dir="ltr"
                href="https://wa.me/963952639157"
                target="_blank" rel="noopener noreferrer"
                className="font-bold text-emerald-300 hover:underline"
              >
                0952639157
              </a>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {developer.instagram && (
                <a
                  href={developer.instagram}
                  target="_blank" rel="noopener noreferrer"
                  className={socialCls}
                  aria-label="إنستغرام"
                >
                  <InstagramIcon className="size-4" />
                </a>
              )}
              {developer.facebook && (
                <a
                  href={developer.facebook}
                  target="_blank" rel="noopener noreferrer"
                  className={socialCls}
                  aria-label="فيسبوك"
                >
                  <FacebookIcon className="size-4" />
                </a>
              )}
              <a
                href={`https://wa.me/963${developer.phone?.replace(/^0/, '')}`}
                target="_blank" rel="noopener noreferrer"
                className={socialCls}
                aria-label="واتساب"
              >
                <MessageCircle className="size-4" />
              </a>
              <a
                href={`mailto:support@dalil-altaybeh.com`}
                className={socialCls}
                aria-label="بريد"
              >
                <AtSign className="size-4" />
              </a>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] leading-5 text-white/40">
              <ShieldCheck className="size-3.5 shrink-0 text-emerald-300" />
              يهدف هذا الدليل للتثقيف ولا يُغني عن استشارة الطبيب المختص.
            </p>
          </div>
        </div>

        {pushSupported() && (
          <div className="mt-5 flex flex-col items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-400 text-primary-dark">
                {pushOn ? <BellRing className="size-4" /> : <BellOff className="size-4" />}
              </span>
              <div>
                <p className="text-xs font-black text-white">إشعارات {APP_NAME}</p>
                <p className="text-[11px] text-white/60">صيدلية المناوبة كل 8 ساعات، الجهات الجديدة، وتحديثات المواعيد.</p>
                {pushMsg && <p className="text-[10px] font-bold text-emerald-300">{pushMsg}</p>}
              </div>
            </div>
            <button
              onClick={() => void enablePush()}
              disabled={pushOn || pushBusy}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-3.5 py-2 text-xs font-bold text-primary-dark transition hover:bg-emerald-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              <BellRing className="size-3.5" />
              {pushOn ? 'الإشعارات مفعّلة' : pushBusy ? 'جارٍ التفعيل…' : 'تفعيل الإشعارات'}
            </button>
          </div>
        )}

        <div className="mt-5 flex flex-col items-center gap-1.5 border-t border-white/10 pt-4 text-[11px] text-white/40 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {APP_NAME} — جميع الحقوق محفوظة</p>
          <p className="flex items-center gap-1.5">
            <Code2 className="size-3 text-emerald-300" />
            تطوير {developer.name}
          </p>
        </div>
      </div>
    </footer>
  )
}
