# -*- coding: utf-8 -*-
# إعادة تصميم الفوتر: خلفية داكنة بهوية المنصة + أعمدة مميزة ببطاقات شفافة
footer = """import { useState } from 'react'
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

  const colCls = 'rounded-2xl bg-white/[0.07] p-5 backdrop-blur-sm'
  const headCls = 'mb-4 text-sm font-black text-white'
  const linkCls = 'transition-colors hover:text-white'
  const socialCls = 'flex size-10 items-center justify-center rounded-xl border border-white/20 text-white/70 transition-colors hover:border-white hover:bg-white/10 hover:text-white'

  return (
    <footer className="mt-16 bg-gradient-to-b from-primary-dark to-[#02251f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className={colCls}>
            <div className="[&_\\[data-logo-text\\]]:text-white [&_span]:!text-white [&_.text-primary]:!text-emerald-200">
              <Logo inverse />
            </div>
            <p className="mt-4 text-sm leading-7 text-white/70">
              دليل الخدمات الطبية في مدينة طيبة الإمام. كل ما تحتاجه من خدمات صحية في مكان واحد.
            </p>
          </div>

          <div className={colCls}>
            <h4 className={headCls}>الأقسام</h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-white/70">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={colCls}>
            <h4 className={headCls}>تواصل معنا</h4>
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
              <Phone className="size-4 text-emerald-300" />
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
            <div className="mt-5 flex items-center gap-3">
              {developer.instagram && (
                <a
                  href={developer.instagram}
                  target="_blank" rel="noopener noreferrer"
                  className={socialCls}
                  aria-label="إنستغرام"
                >
                  <InstagramIcon className="size-4.5" />
                </a>
              )}
              {developer.facebook && (
                <a
                  href={developer.facebook}
                  target="_blank" rel="noopener noreferrer"
                  className={socialCls}
                  aria-label="فيسبوك"
                >
                  <FacebookIcon className="size-4.5" />
                </a>
              )}
              <a
                href={`https://wa.me/963${developer.phone?.replace(/^0/, '')}`}
                target="_blank" rel="noopener noreferrer"
                className={socialCls}
                aria-label="واتساب"
              >
                <MessageCircle className="size-4.5" />
              </a>
              <a
                href={`mailto:support@dalil-altaybeh.com`}
                className={socialCls}
                aria-label="بريد"
              >
                <AtSign className="size-4.5" />
              </a>
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs text-white/70">
              <ShieldCheck className="size-5 shrink-0 text-emerald-300" />
              يهدف هذا الدليل للتثقيف ولا يُغني عن استشارة الطبيب المختص.
            </div>
          </div>
        </div>

        {pushSupported() && (
          <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl bg-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-primary-dark shadow-md">
                {pushOn ? <BellRing className="size-5" /> : <BellOff className="size-5" />}
              </span>
              <div>
                <p className="text-sm font-black text-white">إشعارات {APP_NAME}</p>
                <p className="mt-0.5 text-xs leading-6 text-white/70">
                  صيدلية المناوبة كل 8 ساعات، الجهات الجديدة، وتحديثات طلبات المواعيد — تصلك حتى وأنت خارج الموقع.
                </p>
                {pushMsg && <p className="mt-1 text-[11px] font-bold text-emerald-300">{pushMsg}</p>}
              </div>
            </div>
            <button
              onClick={() => void enablePush()}
              disabled={pushOn || pushBusy}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-primary-dark shadow transition hover:bg-emerald-300 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              <BellRing className="size-4" />
              {pushOn ? 'الإشعارات مفعّلة' : pushBusy ? 'جارٍ التفعيل…' : 'تفعيل الإشعارات'}
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-white/15 pt-6 text-xs text-white/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {APP_NAME} — جميع الحقوق محفوظة</p>
          <p className="flex items-center gap-1.5">
            <Code2 className="size-3.5 text-emerald-300" />
            تطوير {developer.name} — <a href={`https://wa.me/963${developer.phone?.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:underline" dir="ltr">{developer.phone}</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
"""
open(r"C:\Users\DELL\Desktop\help\src\components\layout\Footer.tsx", "w", encoding="utf-8").write(footer)
print("4) Footer redesigned")
