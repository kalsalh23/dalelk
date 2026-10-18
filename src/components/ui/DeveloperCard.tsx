import { Phone, Code2, BadgeCheck, MessageCircle } from 'lucide-react'
import { InstagramIcon, FacebookIcon } from '@/components/ui/BrandIcons'
import { LogoMark } from '@/components/ui/Logo'
import { APP_NAME, DEFAULT_DEVELOPER } from '@/constants'
import type { DeveloperInfo } from '@/types'

/**
 * البطاقة المميزة لمطوّر المنصة — تُستخدم في صفحة «عن المنصة» وصفحة «من نحن»
 */
export function DeveloperFeatureCard({ developer = DEFAULT_DEVELOPER as DeveloperInfo }: { developer?: DeveloperInfo }) {
  const wa = `https://wa.me/963${(developer.phone ?? '').replace(/^0/, '')}`
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-bl from-primary-dark via-primary-dark to-wine-dark p-[1.5px] shadow-[var(--shadow-card)]">
      <div className="relative overflow-hidden rounded-[21px] bg-gradient-to-bl from-primary-dark to-wine-dark p-6 sm:p-8">
        {/* زخارف خلفية */}
        <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 size-56 rounded-full bg-gold/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-white/10 text-gold">
              <Code2 className="size-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold tracking-wide text-gold">بطاقة المطوّر</p>
              <h3 className="text-lg font-black text-white">مطوّر وتقني {APP_NAME}</h3>
            </div>
            <LogoMark className="ms-auto hidden size-11 rounded-xl shadow-lg sm:block" />
          </div>

          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-gold text-3xl font-black text-primary-dark shadow-lg ring-4 ring-white/15 sm:size-24">
                {developer.name?.replace(/^م\.\s*/, '').trim().slice(0, 1) ?? 'م'}
              </div>
              <span className="absolute -bottom-1.5 -left-1.5 flex size-7 items-center justify-center rounded-full bg-surface text-primary shadow">
                <BadgeCheck className="size-4.5" />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xl font-black text-white">{developer.name}</p>
              <p className="mt-0.5 text-sm font-semibold text-gold">{developer.title ?? 'مطوّر المنصة'}</p>
              <p className="mt-2 text-xs leading-6 text-white/70">
                تطوير وإشراف فني كامل على المنصة — للدعم الفني والاستفسارات التقنية تواصل مباشرة عبر القنوات التالية.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`tel:${developer.international_phone ?? developer.phone ?? ''}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-primary-dark shadow transition hover:bg-gold-soft"
                >
                  <Phone className="size-4" />
                  <span dir="ltr">{developer.phone}</span>
                </a>
                <a
                  href={wa}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20"
                >
                  <MessageCircle className="size-4" />
                  واتساب
                </a>
                {developer.instagram && (
                  <a
                    href={developer.instagram}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-fuchsia-600 to-pink-500 px-4 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
                  >
                    <InstagramIcon className="size-4" />
                    إنستغرام
                  </a>
                )}
                {developer.facebook && (
                  <a
                    href={developer.facebook}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-bold text-white shadow transition hover:opacity-90"
                  >
                    <FacebookIcon className="size-4" />
                    فيسبوك
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
