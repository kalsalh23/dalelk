import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useEntities } from '@/hooks/useEntities'
import type { EntityType } from '@/types'
import { EntityCard } from '@/components/entities/EntityCard'
import { Skeletons, EmptyState, ErrorState } from '@/components/ui/States'
import { Pagination } from '@/components/ui/Pagination'
import { SPECIALTIES, DEFAULT_CITY } from '@/constants'
import { Select, Input } from '@/components/ui/Field'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

const PAGE_SIZE = 12

export function EntityListPage({
  type,
  title,
  subtitle,
  showSpecialtyFilter,
  extraFilters,
  navPrefix,
}: {
  type: EntityType
  title: string
  subtitle?: string
  showSpecialtyFilter?: boolean
  extraFilters?: React.ReactNode
  navPrefix?: string
}) {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [specialty, setSpecialty] = useState(params.get('specialty') ?? '')
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)

  const { data, isLoading, isError, refetch } = useEntities<Record<string, unknown>>(type, {
    search: search || undefined,
    specialty: specialty || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE)), [data])

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault()
    setParams((p) => {
      const next = new URLSearchParams(p)
      if (search) next.set('q', search)
      else next.delete('q')
      next.set('page', '1')
      return next
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Breadcrumbs items={[{ label: title }]} />
        <h1 className="mt-3 text-2xl font-black text-ink sm:text-3xl">{title}</h1>
        <p className="mt-1.5 text-sm text-muted">
          {subtitle ?? `تصفح دليل ${navPrefix ?? title} في مدينة ${DEFAULT_CITY}`}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <form onSubmit={applySearch} className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم…"
            className="pr-11"
          />
        </form>
        {showSpecialtyFilter && (
          <Select value={specialty} onChange={(e) => {
            setSpecialty(e.target.value)
            setParams((p) => {
              const next = new URLSearchParams(p)
              if (e.target.value) next.set('specialty', e.target.value)
              else next.delete('specialty')
              next.set('page', '1')
              return next
            })
          }} className="lg:w-64">
            <option value="">كل الاختصاصات</option>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        )}
        {extraFilters}
      </div>

      {isLoading ? (
        <Skeletons rows={6} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data?.data.length ? (
        <EmptyState
          title="لا توجد نتائج"
          description="جرّب تعديل كلمات البحث أو اختصاصاً آخر."
        />
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{data.count} نتيجة</span>
          </div>
          <div className="mt-2 space-y-3">
            {data.data.map((item, i) => (
              <EntityCard key={String(item.id)} type={type} item={item} index={i} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={(p) => setParams((pr) => {
            const next = new URLSearchParams(pr)
            next.set('page', String(p))
            return next
          })} />
        </>
      )}
    </div>
  )
}