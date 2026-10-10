import { useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope } from 'lucide-react'
import { useEntities } from '@/hooks/useEntities'
import { EntityCard } from '@/components/entities/EntityCard'
import { Skeletons, EmptyState, ErrorState } from '@/components/ui/States'
import { Pagination } from '@/components/ui/Pagination'
import { Breadcrumbs, SectionTitle } from '@/components/ui/Breadcrumbs'
import { SPECIALTIES, DEFAULT_CITY } from '@/constants'

const PAGE_SIZE = 12

export function SpecialtyDetailPage() {
  const { specialty } = useParams<{ specialty: string }>()
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)

  const decodedSpecialty = specialty ? decodeURIComponent(specialty) : ''
  const isValid = SPECIALTIES.includes(decodedSpecialty)

  const { data, isLoading, isError, refetch } = useEntities<Record<string, unknown>>('doctor', {
    specialty: decodedSpecialty || undefined,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  })

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE)), [data])

  if (!isValid && decodedSpecialty) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <EmptyState title="اختصار غير موجود" description="لم يتم العثور على هذا التخصص في قاعدة البيانات." />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: 'الأطباء', to: '/doctors' }, { label: decodedSpecialty }]} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mt-4 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-right">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary-light/50 text-primary">
            <Stethoscope className="size-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-ink sm:text-3xl">{decodedSpecialty || 'كل الأطباء'}</h1>
            <p className="mt-1 text-sm text-muted">
              {data?.count ?? 0} طبيب في تخصص {decodedSpecialty} في مدينة {DEFAULT_CITY}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-6">
        <SectionTitle
          title="أطباء هذا التخصص"
          subtitle="قائمة موثّقة بالأطباء المتخصصين في هذا مجال"
          icon={<Stethoscope className="size-5" />}
        />
      </div>

      {isLoading ? (
        <Skeletons rows={6} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !data?.data.length ? (
        <EmptyState
          title="لا توجد نتائج"
          description="لا توجد أطباء في هذا التخصص حالياً. جرّب تخصصاً آخر."
        />
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{data.count} طبيب</span>
          </div>
          <div className="mt-2 space-y-3">
            {data.data.map((item, i) => (
              <EntityCard key={String(item.id)} type="doctor" item={item} index={i} />
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