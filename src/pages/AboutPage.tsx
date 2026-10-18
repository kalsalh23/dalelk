import { useQuery } from '@tanstack/react-query'
import { Phone, Mail, MapPin, HeartPulse, ShieldCheck, Info, User, Code2, MessageCircle } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Card, CardBody } from '@/components/ui/Card'
import { Seo } from '@/components/seo/Seo'
import { fetchSiteSettings } from '@/services/site'
import { APP_NAME, APP_SLOGAN, DEFAULT_CITY, DEFAULT_DEVELOPER } from '@/constants'
import { InstagramIcon, FacebookIcon } from '@/components/ui/BrandIcons'

export function AboutPage() {
  const { data: settings } = useQuery({ queryKey: ['site-settings'], queryFn: fetchSiteSettings })
  const about = settings?.about
  const dev = settings?.developer ?? DEFAULT_DEVELOPER

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Seo
        title="من نحن"
        description={`تعرف على ${APP_NAME} — منصة الدليل الصحي الرقمي لمدينة ${DEFAULT_CITY}، وفريق الدعم والمطوّر.`}
        path="/about"
        type="website"
      />
      <Breadcrumbs items={[{ label: 'من نحن' }]} />
      <h1 className="mt-4 text-2xl font-black text-ink sm:text-3xl">من نحن</h1>

      <div className="mt-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 pb-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-white">
                <HeartPulse className="size-5" />
              </div>
              <h2 className="text-lg font-black text-ink">{APP_NAME}</h2>
            </div>
            <p className="text-sm leading-8 text-muted">{about?.content ?? APP_SLOGAN}</p>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-muted">
              <MapPin className="size-4 text-primary" />
              {DEFAULT_CITY}، سوريا
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 pb-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
                <Info className="size-5" />
              </div>
              <h2 className="text-lg font-black text-ink">ما نقدمه</h2>
            </div>
            <ul className="space-y-2 text-sm leading-7 text-muted">
              <li className="flex items-start gap-2"><ShieldCheck className="mt-1 size-4 shrink-0 text-primary" />دليل موثّق للأطباء والعيادات والمشافي والصيدليات والمراكز الصحية.</li>
              <li className="flex items-start gap-2"><MapPin className="mt-1 size-4 shrink-0 text-primary" />المواقع الجغرافية على الخريطة لسهولة الوصول.</li>
              <li className="flex items-start gap-2"><Phone className="mt-1 size-4 shrink-0 text-primary" />أرقام التواصل وساعات الدوام لكل جهة.</li>
              <li className="flex items-start gap-2"><HeartPulse className="mt-1 size-4 shrink-0 text-primary" />نصائح طبية تثقيفية وقاعدة أسئلة وأجوبة صحية.</li>
            </ul>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 pb-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
                <MessageCircle className="size-5" />
              </div>
              <h2 className="text-lg font-black text-ink">الدعم الفني</h2>
            </div>
            <div className="space-y-3 text-sm">
              <details className="group rounded-2xl border border-border bg-slate-50 p-4">
                <summary className="cursor-pointer font-bold text-ink">الاتصال بدعم المنصة</summary>
                <div className="mt-3 space-y-2">
                  <a href={`tel:${about?.support_phone ?? ''}`} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
                    <span className="flex items-center gap-1.5 text-muted"><Phone className="size-4 text-primary" />الهاتف</span>
                    <span className="font-bold text-primary" dir="ltr">{about?.support_phone ?? '—'}</span>
                  </a>
                  <a href={`mailto:${about?.support_email ?? ''}`} className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
                    <span className="flex items-center gap-1.5 text-muted"><Mail className="size-4 text-primary" />البريد الإلكتروني</span>
                    <span className="font-bold text-primary" dir="ltr">{about?.support_email ?? '—'}</span>
                  </a>
                </div>
              </details>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Card className="overflow-hidden border-primary/30 bg-gradient-to-l from-primary-light/40 to-background">
          <CardBody>
            <div className="flex items-center gap-2 pb-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25">
                <Code2 className="size-5" />
              </div>
              <h2 className="text-lg font-black text-ink">مطوّر المنصة</h2>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-4 border-surface bg-primary text-2xl font-black text-white shadow-lg sm:size-20">
                {dev.name?.replace(/^م\.\s*/, '').trim().slice(0, 1) ?? 'م'}
              </div>
              <div className="flex-1">
                <p className="text-lg font-black text-ink">{dev.name ?? 'مطور المنصة'}</p>
                <p className="text-sm text-muted">{dev.title ?? 'مطور برمجيات'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`tel:${dev.phone ?? ''}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-dark"
                  >
                    <Phone className="size-3.5" />
                    {dev.phone ?? '—'}
                  </a>
                  <a
                    href={`tel:${dev.international_phone ?? ''}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-surface px-4 py-2 text-xs font-bold text-primary-dark transition hover:bg-primary-light"
                    dir="ltr"
                  >
                    <Phone className="size-3.5" />
                    {dev.international_phone ?? ''}
                  </a>
                  {dev.instagram ? (
                    <a
                      href={dev.instagram}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-fuchsia-600 to-pink-500 px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
                    >
                      <InstagramIcon className="size-3.5" />
                      إنستغرام
                    </a>
                  ) : null}
                  {dev.facebook ? (
                    <a
                      href={dev.facebook}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
                    >
                      <FacebookIcon className="size-3.5" />
                      فيسبوك
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted">
              <User className="size-3.5 text-primary" />
              تطوير وإشراف فني كامل على منصة {APP_NAME}.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}