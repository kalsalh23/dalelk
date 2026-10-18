import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Megaphone, CalendarDays, ExternalLink, ArrowRight, Share2 } from 'lucide-react'
import { fetchAdById, incrementAdClick } from '@/services/site'
import { getPublicUrl } from '@/lib/supabase'
import { Seo } from '@/components/seo/Seo'
import { formatDate } from '@/lib/utils'
import { track } from '@/services/stats'
import type { Advertisement } from '@/types'

export default function AdDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: ad, isLoading } = useQuery({
    queryKey: ['ad', id],
    queryFn: () => fetchAdById(id!),
    enabled: !!id,
  })

  const share = async (a: Advertisement) => {
    const url = window.location.href
    void track('share', { entityType: 'pharmacy', entityId: a.id })
    if (navigator.share) {
      try { await navigator.share({ title: a.title, text: a.description ?? a.title, url }) } catch { /* ألغى المستخدم */ }
    } else {
      try { await navigator.clipboard.writeText(url) } catch { /* تجاهل */ }
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6"><div className="mx-auto max-w-3xl animate-pulse space-y-4"><div className="h-64 rounded-2xl bg-subtle" /><div className="h-8 w-2/3 rounded-xl bg-subtle" /><div className="h-24 rounded-xl bg-subtle" /></div></div>
  }

  if (!ad) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center">
        <Megaphone className="mx-auto size-12 text-muted" />
        <h1 className="mt-4 text-xl font-black text-ink">الإعلان غير موجود</h1>
        <p className="mt-2 text-sm text-muted">انتهت صلاحية هذا الإعلان أو تم حذفه.</p>
        <a href="/ads" className="mt-5 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark">جميع الإعلانات</a>
      </div>
    )
  }

  const image = getPublicUrl(ad.image) ?? undefined
  const dateLabel = ad.created_at ? formatDate(ad.created_at) : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Seo title={ad.title} description={ad.description ?? ad.title} image={image ?? null} path={`/ads/${ad.id}`} type="article" />

      <button onClick={() => history.back()} className="mb-5 inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-primary">
        <ArrowRight className="size-4" />
        العودة للإعلانات
      </button>

      <article className="overflow-hidden rounded-[22px] border border-primary/20 bg-surface shadow-[var(--shadow-card)]">
        {image ? (
          <img src={image} alt={ad.title} className="h-56 w-full object-cover sm:h-72" />
        ) : (
          <div className="flex h-44 items-center justify-center bg-gradient-to-l from-primary-light/50 to-primary-light/20">
            <Megaphone className="size-14 text-primary/40" />
          </div>
        )}
        <div className="p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black text-primary">إعلان</span>
            {dateLabel && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                <CalendarDays className="size-3.5" />
                {dateLabel}
              </span>
            )}
            <button
              onClick={() => void share(ad)}
              title="مشاركة الإعلان"
              aria-label="مشاركة الإعلان"
              className="ms-auto flex size-9 cursor-pointer items-center justify-center rounded-full border border-border text-muted transition hover:border-primary hover:bg-primary-light hover:text-primary"
            >
              <Share2 className="size-4" />
            </button>
          </div>

          <h1 className="mt-3 text-2xl font-black text-ink sm:text-3xl">{ad.title}</h1>

          {ad.description ? (
            <div className="mt-4 whitespace-pre-line text-sm leading-8 text-ink sm:text-[15px]">{ad.description}</div>
          ) : null}

          {ad.link ? (
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void incrementAdClick(ad.id)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark"
            >
              <ExternalLink className="size-4" />
              زيارة الرابط
            </a>
          ) : null}
        </div>
      </article>

      <p className="mt-4 text-center text-[11px] text-muted">
        هذا الإعلان من جهة خارجية — دليل طيبة الإمام الطبي لا يتحمل مسؤولية محتواه.
      </p>
    </div>
  )
}
