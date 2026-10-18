# -*- coding: utf-8 -*-
# 1) خدمة fetchAdById  2) صفحة تفاصيل الإعلان  3) صفحة الإعلانات  4) المسارات  5) ربط بطاقة الهيرو

# ===== 1) service =====
p = r"C:\Users\DELL\Desktop\help\src\services\site.ts"
t = open(p, encoding="utf-8").read()
anchor = "export async function fetchAllAds()"
add = """export async function fetchAdById(id: string): Promise<Advertisement | null> {
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('advertisements')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .maybeSingle()
  return (data ?? null) as Advertisement | null
}

"""
assert anchor in t, "service anchor"
t = t.replace(anchor, add + anchor, 1)
open(p, "w", encoding="utf-8").write(t)
print("1) fetchAdById added")

# ===== 2) صفحة تفاصيل الإعلان =====
details = """import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Megaphone, CalendarDays, ExternalLink, ArrowRight, Share2, Globe } from 'lucide-react'
import { fetchAdById, incrementAdClick } from '@/services/site'
import { getPublicUrl } from '@/lib/supabase'
import { Seo } from '@/components/seo/Seo'
import { ErrorState } from '@/components/ui/States'
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
"""
open(r"C:\Users\DELL\Desktop\help\src\pages\AdDetailsPage.tsx", "w", encoding="utf-8").write(details)
print("2) AdDetailsPage created")

# ===== 3) صفحة الإعلانات =====
listing = """import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Megaphone } from 'lucide-react'
import { fetchAds } from '@/services/site'
import { getPublicUrl } from '@/lib/supabase'
import { Seo } from '@/components/seo/Seo'
import { SkeletonRows, EmptyState } from '@/components/ui/States'

export default function AdsPage() {
  const { data: ads, isLoading } = useQuery({ queryKey: ['ads', 'home'], queryFn: () => fetchAds('home') })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Seo title="الإعلانات" description="إعلانات وخدمات جهات طبية وصحية في طيبة الإمام" path="/ads" />
      <h1 className="flex items-center gap-2 text-2xl font-black text-ink">
        <Megaphone className="size-6 text-primary" />
        الإعلانات
      </h1>
      <p className="mt-1 text-sm text-muted">إعلانات وخدمات جهات طبية وصحية في المدينة.</p>

      <div className="mt-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-40 rounded-2xl bg-subtle" />
            <div className="h-40 rounded-2xl bg-subtle" />
          </div>
        ) : !ads?.length ? (
          <EmptyState icon={Megaphone} title="لا توجد إعلانات حالياً" message="ستظهر هنا إعلانات الجهات الطبية والصحية عند توفرها." />
        ) : (
          <ul className="space-y-4">
            {ads.map((ad) => (
              <li key={ad.id}>
                <Link
                  to={`/ads/${ad.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-primary/20 bg-surface p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
                >
                  {ad.image ? (
                    <img src={getPublicUrl(ad.image) ?? undefined} alt={ad.title} loading="lazy" className="h-20 w-24 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Megaphone className="size-8 text-primary/50" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="mb-1 inline-flex w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">إعلان</span>
                    <span className="block truncate text-sm font-black text-ink group-hover:text-primary-dark">{ad.title}</span>
                    {ad.description ? <span className="mt-0.5 line-clamp-1 block text-xs text-muted">{ad.description}</span> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] text-muted">
        هل تريد إدراج إعلانك؟ راسل فريق المنصة من صفحة «عن المنصة».
      </p>
    </div>
  )
}
"""
open(r"C:\Users\DELL\Desktop\help\src\pages\AdsPage.tsx", "w", encoding="utf-8").write(listing)
print("3) AdsPage created")

# ===== 4) المسارات =====
p4 = r"C:\Users\DELL\Desktop\help\src\routes\index.tsx"
t4 = open(p4, encoding="utf-8").read()
old4 = "      { path: 'ask', lazy: () => import('@/pages/AskPage').then((m) => ({ Component: m.AskPage })) },"
new4 = """      { path: 'ask', lazy: () => import('@/pages/AskPage').then((m) => ({ Component: m.AskPage })) },
      { path: 'ads', lazy: () => import('@/pages/AdsPage').then((m) => ({ default: m.default })) },
      { path: 'ads/:id', lazy: () => import('@/pages/AdDetailsPage').then((m) => ({ default: m.default })) },"""
assert old4 in t4, "routes anchor"
t4 = t4.replace(old4, new4, 1)
open(p4, "w", encoding="utf-8").write(t4)
print("4) routes added")

# ===== 5) بطاقة الهيرو تفتح صفحة التفاصيل =====
p5 = r"C:\Users\DELL\Desktop\help\src\features\home\Hero.tsx"
t5 = open(p5, encoding="utf-8").read()

old5 = """import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'"""
new5 = """import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'"""
if old5 in t5:
    t5 = t5.replace(old5, new5, 1)

old6 = """function HeroAds() {
  const { data: ads } = useQuery"""
new6 = """function HeroAds() {
  const nav = useNavigate()
  const { data: ads } = useQuery"""
assert old6 in t5, "HeroAds anchor"
t5 = t5.replace(old6, new6, 1)

old7 = """          <motion.a
            key={ad.id}
            href={href ?? undefined}
            target={href ? '_blank' : undefined}
            rel={href ? 'noopener noreferrer' : undefined}
            onClick={() => href && void incrementAdClick(ad.id)}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.5 }}
            className="group flex items-center gap-3.5 rounded-2xl border border-primary/25 bg-surface p-3 text-start shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl"
          >"""
new7 = """          <motion.div
            key={ad.id}
            onClick={() => { void incrementAdClick(ad.id); nav(`/ads/${ad.id}`) }}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.5 }}
            className="group flex cursor-pointer items-center gap-3.5 rounded-2xl border border-primary/25 bg-surface p-3 text-start shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl"
          >"""
assert old7 in t5, "card anchor"
t5 = t5.replace(old7, new7, 1)

old8 = """          </motion.a>
        </AnimatePresence>"""
new8 = """          </motion.div>
        </AnimatePresence>"""
assert old8 in t5, "closing anchor"
t5 = t5.replace(old8, new8, 1)

open(p5, "w", encoding="utf-8").write(t5)
print("5) hero card wired to details page")
