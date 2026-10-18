import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Megaphone } from 'lucide-react'
import { fetchAds } from '@/services/site'
import { getPublicUrl } from '@/lib/supabase'
import { Seo } from '@/components/seo/Seo'
import { EmptyState } from '@/components/ui/States'

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
          <EmptyState title="لا توجد إعلانات حالياً" description="ستظهر هنا إعلانات الجهات الطبية والصحية عند توفرها." />
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
