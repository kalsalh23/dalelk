import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Phone, MessageCircle, MapPin, Clock, BadgeCheck,
  Monitor, Siren, Star,
} from 'lucide-react'
import { useEntity } from '@/hooks/useEntities'
import { ENTITY_TABLES } from '@/services/content'
import { FullPageLoader, ErrorState } from '@/components/ui/States'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { VerifiedBadge, PlanBadge } from '@/components/ui/Badge'
import { InteractiveMap } from '@/components/shared/Map'
import { getPublicUrl } from '@/lib/supabase'
import { waLink, mapsLink, cn } from '@/lib/utils'
import { ENTITY_LABELS } from '@/constants'
import type { EntityType, WorkHours } from '@/types'
import { EntityIcon } from '@/components/ui/EntityIcon'
import { track, incrementViewCount } from '@/services/stats'
import { Seo } from '@/components/seo/Seo'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'

const DAY_ORDER = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']
const DAY_NAMES: Record<string, string> = {
  sat: 'السبت', sun: 'الأحد', mon: 'الاثنين', tue: 'الثلاثاء',
  wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardBody>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-ink">
          <span className="h-6 w-1 rounded-full bg-primary" />
          {title}
        </h2>
        {children}
      </CardBody>
    </Card>
  )
}

function Chips({ items, color }: { items: string[] | null | undefined; color?: string }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <span
          key={it}
          className="rounded-xl border border-primary/15 bg-primary-light/40 px-3 py-1.5 text-xs font-semibold text-primary-dark"
          style={color ? { backgroundColor: `${color}14`, color, borderColor: `${color}33` } : undefined}
        >
          {it}
        </span>
      ))}
    </div>
  )
}

function WorkHoursTable({ hours }: { hours: WorkHours }) {
  if (!hours) return null
  return (
    <div className="divide-y divide-border rounded-2xl border border-border overflow-hidden">
      {DAY_ORDER.map((d) => {
        if (!(d in hours)) return null
        return (
          <div key={d} className="flex items-center justify-between bg-surface px-4 py-2.5 text-sm">
            <span className="font-semibold text-ink">{DAY_NAMES[d]}</span>
            <span className={cn('font-medium', String(hours[d]).includes('مغلق') || String(hours[d]).includes('إجازة') ? 'text-error' : 'text-primary')}>
              {hours[d] ?? '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function EntityDetailPage({ type, title }: { type: EntityType; title: string }) {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, isError, refetch } = useEntity<Record<string, unknown>>(type, slug)
  const [imgError, setImgError] = useState(false)
  const [ready, setReady] = useState(data)

  useEffect(() => {
    if (data) {
      setReady(data)
      void incrementViewCount(ENTITY_TABLES[type], String(data.id))
      void track('profile_view', { entityType: type, entityId: String(data.id) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading) return <FullPageLoader label="جارٍ تحميل الملف…" />
  if (isError || !ready) return <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><ErrorState message="تعذر العثور على هذا العنصر." onRetry={() => void refetch()} /></div>

  const name = String(ready.name ?? '')
  const specialty = (ready.specialty as string) ?? null
  const description = (ready.description as string) ?? (ready.bio as string) ?? null
  const address = (ready.address as string) ?? null
  const phone = (ready.phone as string) ?? null
  const whatsapp = (ready.whatsapp as string) ?? null
  const lat = ready.lat as number
  const lng = ready.lng as number
  const image = getPublicUrl(ready.image as string)
  const gallery = ((ready.gallery as string[]) ?? []).map(getPublicUrl).filter(Boolean)
  const videoUrl = (ready.video_url as string) ?? null
  const services = (ready.services as string[] | null) ?? null
  const hours = (ready.work_hours as WorkHours) ?? null
  const certified = Boolean(ready.is_verified)
  const plan = (ready.plan as string) ?? 'free'
  const rating = ready.rating ? Number(ready.rating) : null

  const routeLink = `${type === 'health_center' ? 'health-centers' : type === 'radiology' ? 'radiology' : `${type}s`}`

  const schema: object[] = [
    {
      '@context': 'https://schema.org',
      '@type': type === 'doctor' ? 'Physician' : 'MedicalBusiness',
      name: name ?? undefined,
      description: description ?? undefined,
      image: image ?? undefined,
      address: { '@type': 'PostalAddress', addressLocality: 'طيبة الإمام', addressCountry: 'SY' },
      phone: (phone as string) ?? undefined,
      hasMap: lat && lng ? mapsLink(lat, lng, address) : undefined,
    },
    breadcrumbSchema([
      { label: 'الرئيسية', url: absoluteUrl('/') },
      { label: title, url: absoluteUrl(`/${routeLink}`) },
      { label: name },
    ]),
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Seo
        title={name}
        description={description ?? name}
        image={image}
        path={`/${routeLink}/${slug}`}
        type="profile"
        jsonLd={schema}
      />

      <div className="mb-6">
        <Breadcrumbs
          items={[
            { label: title, to: `/${routeLink}` },
            { label: name },
          ]}
        />
      </div>

      {/* بطاقة رئيسية */}
      <div className="mb-6 overflow-hidden rounded-[18px] border border-border bg-surface shadow-[var(--shadow-card)]">
        <div className="h-40 w-full bg-gradient-to-l from-primary to-primary-dark sm:h-52">
          {image && !imgError && (
            <img src={image} alt={name} onError={() => setImgError(true)} className="h-full w-full object-cover opacity-90" />
          )}
        </div>
        <div className="px-5 pb-5 pt-0 sm:px-8">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div
              className={cn(
                'flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-surface bg-primary-light text-primary-dark shadow-lg sm:size-32',
                imgError || !image ? 'relative' : '',
              )}
            >
              {image && !imgError ? (
                <img src={image} alt={name} className="h-full w-full object-cover" />
              ) : (
                <EntityIcon type={type} className="size-12" />
              )}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-ink sm:text-3xl">{name}</h1>
                {certified && <VerifiedBadge />}
                {plan !== 'free' && <PlanBadge plan={plan} />}
              </div>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-primary-dark">
                <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold">
                  {specialty ?? ENTITY_LABELS[type]}
                </span>
                {rating ? (
                  <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    {rating.toFixed(1)}
                  </span>
                ) : null}
              </p>
              {address && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="size-4 text-primary" />
                  {address}
                </p>
              )}
            </div>
          </div>

          {(phone || whatsapp) && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {phone && (
                <Button size="lg" onClick={() => void track('phone_click', { entityType: type, entityId: String(ready.id) })} asChild>
                  <a href={`tel:${phone}`} className="!w-full sm:!flex-1">
                    <Phone className="size-5" />
                    اتصال
                  </a>
                </Button>
              )}
              {whatsapp && (
                <Button size="lg" variant="whatsapp" onClick={() => void track('whatsapp_click', { entityType: type, entityId: String(ready.id) })} asChild>
                  <a href={waLink(whatsapp, `مرحباً، أود الاستفسار من ${name}`)} target="_blank" rel="noopener noreferrer" className="!w-full sm:!flex-1">
                    <MessageCircle className="size-5" />
                    واتساب
                  </a>
                </Button>
              )}
              {(lat && lng) || address ? (
                <Button size="lg" variant="secondary" onClick={() => void track('map_click', { entityType: type, entityId: String(ready.id) })} asChild>
                  <a href={mapsLink(lat, lng, address)} target="_blank" rel="noopener noreferrer" className="!w-full sm:!flex-1">
                    <MapPin className="size-5" />
                    الموقع
                  </a>
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {description && (
            <Section title="نبذة">
              <p className="whitespace-pre-line text-sm leading-7 text-muted">{description}</p>
            </Section>
          )}

          {type === 'doctor' && (ready.certifications as string[] | null)?.length ? (
            <Section title="الشهادات والمؤهلات">
              <ul className="space-y-2.5">
                {(ready.certifications as string[]).map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted">
                    <BadgeCheck className="mt-0.5 size-4 shrink-0 text-success" />
                    {c}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {type !== 'doctor' && type !== 'pharmacy' && type !== 'lab' && type !== 'radiology' && (ready.departments as string[] | null)?.length ? (
            <Section title="الأقسام">
              <Chips items={ready.departments as string[]} />
            </Section>
          ) : null}

          {services?.length ? (
            <Section title={type === 'lab' ? 'الخدمات والتحاليل' : type === 'radiology' ? 'الخدمات والأجهزة' : 'الخدمات'}>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <span key={s} className="rounded-xl bg-slate-50 border border-border px-3 py-1.5 text-xs font-semibold text-ink">
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          ) : null}

          {type === 'lab' && (ready.tests as string[] | null)?.length ? (
            <Section title="التحاليل">
              <Chips items={ready.tests as string[]} />
            </Section>
          ) : null}

          {type === 'radiology' && (ready.machines as string[] | null)?.length ? (
            <Section title="الأجهزة">
              <div className="grid gap-2 sm:grid-cols-2">
                {(ready.machines as string[]).map((m) => (
                  <div key={m} className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink">
                    <Monitor className="size-4 text-primary" />
                    {m}
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {gallery.length > 0 && (
            <Section title="معرض الصور">
              <div className="grid grid-cols-3 gap-3">
                {gallery.map((g) => (
                  <a key={g} href={g ?? '#'} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-2xl">
                    <img src={g ?? ''} alt="" loading="lazy" className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  </a>
                ))}
              </div>
            </Section>
          )}

          {videoUrl && (
            <Section title="فيديو تعريفي">
              <div className="aspect-video overflow-hidden rounded-2xl">
                <iframe
                  src={videoUrl}
                  title="فيديو تعريفي"
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                />
              </div>
            </Section>
          )}
        </div>

        <div className="space-y-6">
          <Section title="معلومات التواصل">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-muted">الهاتف</span>
                <a href={`tel:${phone}`} className="font-bold text-primary" dir="ltr">{phone ?? '—'}</a>
              </div>
              {ready.emergency_phone ? (
                <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3">
                  <span className="flex items-center gap-1.5 font-bold text-error"><Siren className="size-4" />الطوارئ</span>
                  <a href={`tel:${ready.emergency_phone}`} className="font-bold text-error" dir="ltr">{String(ready.emergency_phone)}</a>
                </div>
              ) : null}
              {whatsapp ? (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-muted">واتساب</span>
                  <a href={waLink(whatsapp)} target="_blank" rel="noopener noreferrer" className="font-bold text-primary" dir="ltr">{whatsapp}</a>
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-muted">العنوان</span>
                <span className="text-left font-semibold text-ink">{address ?? '—'}</span>
              </div>
              {(ready.opening_hours as string | null) && (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="flex items-center gap-1.5 text-muted"><Clock className="size-4" />الدوام</span>
                  <span className="font-semibold text-ink">{String(ready.opening_hours)}</span>
                </div>
              )}
            </div>
          </Section>

          {type === 'doctor' && (ready.experience_years as number | null) ? (
            <Section title="الخبرة">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-light text-2xl font-black text-primary-dark">
                  {Number(ready.experience_years)}
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">سنة خبرة</p>
                  <p className="text-xs text-muted">في الممارسة الطبية</p>
                </div>
              </div>
            </Section>
          ) : null}

          {hours && Object.keys(hours).length > 0 ? (
            <Section title="ساعات الدوام">
              <WorkHoursTable hours={hours} />
            </Section>
          ) : null}

          <Section title={type === 'doctor' ? 'موقع الطبيب' : 'الموقع'}>
            <InteractiveMap
              height="260px"
              markers={lat && lng ? [{ id: String(ready.id), name, entityType: type, lat, lng, phone, address, image: ready.image as string, specialty, slug }] : []}
              zoom={15}
            />
            {(lat && lng) ? (
              <a
                href={mapsLink(lat, lng, address)}
                target="_blank" rel="noopener noreferrer" onClick={() => void track('map_click', { entityType: type, entityId: String(ready.id) })}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-light/40 px-4 py-2.5 text-sm font-bold text-primary-dark transition hover:bg-primary-light"
              >
                <MapPin className="size-4" />
                عرض على الخريطة
              </a>
            ) : null}
          </Section>
        </div>
      </div>
    </div>
  )
}