import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, ArrowRight, Lightbulb } from 'lucide-react'
import { useArticle, useRelatedArticles, useArticleCategories } from '@/hooks/useArticles'
import { FullPageLoader, ErrorState } from '@/components/ui/States'
import { Card } from '@/components/ui/Card'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { getPublicUrl } from '@/lib/supabase'
import { formatDate, truncate } from '@/lib/utils'
import { incrementViewCount } from '@/services/stats'
import { Seo } from '@/components/seo/Seo'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: article, isLoading, isError } = useArticle(slug)
  const { data: categories } = useArticleCategories()
  const { data: related } = useRelatedArticles(article?.category_id ?? null, article?.id ?? '')
  const [ready, setReady] = useState(article)

  useEffect(() => {
    if (article) {
      setReady(article)
      void incrementViewCount('articles', article.id)
    }
  }, [article])

  if (isLoading) return <FullPageLoader label="جارٍ تحميل المقال…" />
  if (isError || !ready) return <div className="mx-auto max-w-4xl px-4 py-16"><ErrorState message="المقال غير موجود أو غير منشور." /></div>

  const category = categories?.find((c) => c.id === ready.category_id)
  const image = getPublicUrl(ready.image)

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Seo
        title={ready.seo_title ?? ready.title}
        description={ready.seo_description ?? ready.excerpt ?? undefined}
        image={image}
        path={`/articles/${ready.slug}`}
        type="article"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: ready.title,
            description: ready.excerpt ?? undefined,
            image: image ?? undefined,
            datePublished: ready.published_at ?? undefined,
            dateModified: ready.updated_at,
          },
          breadcrumbSchema([
            { label: 'الرئيسية', url: absoluteUrl('/') },
            { label: 'النصائح الطبية', url: absoluteUrl('/articles') },
            { label: ready.title },
          ]),
        ]}
      />

      <Breadcrumbs items={[{ label: 'النصائح الطبية', to: '/articles' }, { label: ready.title }]} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="mt-5 text-2xl font-black leading-relaxed text-ink sm:text-4xl sm:leading-relaxed">{ready.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
          {category && (
            <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary-dark">{category.name}</span>
          )}
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-primary" />
            نشر في {formatDate(ready.published_at)}
          </span>
        </div>
      </motion.div>

      {image && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-6 overflow-hidden rounded-[18px]">
          <img src={image} alt={ready.title} className="max-h-[420px] w-full object-cover" />
        </motion.div>
      )}

      <div
        className="prose-ink mt-8 space-y-4 text-[15px] leading-8 text-ink sm:text-base sm:leading-9 [&_p]:my-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-black [&_ul]:list-inside [&_ul]:space-y-1.5 [&_h3]:mt-5 [&_h3]:font-bold"
        dangerouslySetInnerHTML={{ __html: ready.content }}
      />

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm leading-7 text-amber-900">
        <Lightbulb className="mt-0.5 size-5 shrink-0 text-warning" />
        <div>
          <p className="font-bold">تنبيه مهم</p>
          <p>المعلومات المنشورة للتثقيف الصحي فقط ولا تُغني عن استشارة الطبيب أو المختص.</p>
        </div>
      </div>

      {related && related.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-black text-ink">مقالات مرتبطة</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.slice(0, 4).map((r) => (
              <Link key={r.id} to={`/articles/${r.slug}`} className="group block">
                <Card className="flex gap-4 p-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg">
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-primary-light/40">
                    {r.image ? (
                      <img src={getPublicUrl(r.image) ?? ''} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-bold leading-6 text-ink group-hover:text-primary">{r.title}</h3>
                    <p className="mt-1 line-clamp-1 text-xs text-muted">{truncate(r.excerpt, 70)}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 text-center">
        <Link to="/articles" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
          <ArrowRight className="size-4" />
          العودة إلى جميع المقالات
        </Link>
      </div>
    </article>
  )
}