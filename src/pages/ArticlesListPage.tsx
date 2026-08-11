import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Newspaper, CalendarDays, ArrowLeft, Lightbulb } from 'lucide-react'
import { useArticles, useArticleCategories } from '@/hooks/useArticles'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Card } from '@/components/ui/Card'
import { EmptyState, Skeletons, ErrorState } from '@/components/ui/States'
import { Pagination } from '@/components/ui/Pagination'
import { getPublicUrl } from '@/lib/supabase'
import { formatDate, cn } from '@/lib/utils'
import { Seo } from '@/components/seo/Seo'

const PAGE_SIZE = 9

export function ArticlesListPage() {
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<string>('')
  const { data, isLoading, isError, refetch } = useArticles({
    categoryId: category || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })
  const { data: categories } = useArticleCategories()
  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Seo
        title="النصائح الطبية"
        description="مقالات تثقيفية صحية موثوقة في مختلف التخصصات الطبية من دليلك الطبي."
        path="/articles"
      />
      <Breadcrumbs items={[{ label: 'النصائح الطبية' }]} />

      <div className="mb-3 mt-3 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
          <Newspaper className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-ink">النصائح الطبية</h1>
          <p className="text-sm text-muted">مقالات تثقيفية موثوقة في مختلف التخصصات</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => { setCategory(''); setPage(1) }}
          className={cn('rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer',
            !category ? 'bg-primary text-white shadow-sm' : 'bg-surface border border-border text-muted hover:border-primary/40 hover:text-primary')}
        >
          الكل
        </button>
        {(categories ?? []).map((c) => (
          <button
            key={c.id}
            onClick={() => { setCategory(c.id); setPage(1) }}
            className={cn('rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer',
              category === c.id ? 'bg-primary text-white shadow-sm' : 'bg-surface border border-border text-muted hover:border-primary/40 hover:text-primary')}
          >
            {c.name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeletons rows={4} box="!p-0" />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data?.data.length ? (
        <EmptyState title="لا توجد مقالات" description="لم يتم نشر مقالات في هذا التصنيف بعد." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
              >
                <Link to={`/articles/${a.slug}`} className="group block h-full">
                  <Card className="h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                    <div className="h-44 overflow-hidden">
                      {a.image ? (
                        <img
                          src={getPublicUrl(a.image) ?? ''}
                          alt={a.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary-light/40 text-primary-dark">
                          <Newspaper className="size-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="rounded-full bg-primary-light px-2.5 py-0.5 font-bold text-primary-dark">
                          {categories?.find((c) => c.id === a.category_id)?.name ?? 'صحة'}
                        </span>
                        <span className="flex items-center gap-1 text-muted">
                          <CalendarDays className="size-3.5" />
                          {formatDate(a.published_at)}
                        </span>
                      </div>
                      <h3 className="mt-2.5 line-clamp-2 text-base font-black leading-7 text-ink transition-colors group-hover:text-primary">
                        {a.title}
                      </h3>
                      {a.excerpt && <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted">{a.excerpt}</p>}
                      <span className="mt-3 flex items-center gap-1 text-xs font-bold text-primary">
                        قراءة المزيد
                        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />

          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm leading-7 text-amber-900">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-warning" />
            المعلومات المنشورة للتثقيف الصحي فقط ولا تُغني عن استشارة الطبيب أو المختص.
          </div>
        </>
      )}
    </div>
  )
}