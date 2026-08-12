import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope } from 'lucide-react'
import { useFeaturedDoctors } from '@/hooks/useEntities'
import { SectionTitle } from '@/components/ui/Breadcrumbs'
import { EmptyState, Skeletons } from '@/components/ui/States'
import { EntityCard } from '@/components/entities/EntityCard'

export function FeaturedDoctors() {
  const { data, isLoading } = useFeaturedDoctors(8)

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <SectionTitle
        title="الأطباء المميّزون"
        subtitle="نخبة من أطباء مدينة طيبة الإمام، مختارون من إدارة المنصة"
        icon={<Stethoscope className="size-5" />}
      />
      {isLoading ? (
        <Skeletons rows={2} />
      ) : !data?.length ? (
        <EmptyState
          title="لا يوجد أطباء مميّزون بعد"
          description="سيظهر هنا الأطباء الذين تختارهم إدارة المنصة عبر لوحة التحكم."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
            >
              <EntityCard type="doctor" item={doc as unknown as Record<string, unknown>} index={i} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link to="/doctors" className="text-sm font-bold text-primary hover:underline">
          عرض كل الأطباء
        </Link>
      </div>
    </section>
  )
}
