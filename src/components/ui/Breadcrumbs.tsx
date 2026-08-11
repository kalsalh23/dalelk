import { Link } from 'react-router-dom'
import { ChevronLeft, Home } from 'lucide-react'
import { APP_NAME } from '@/constants'
import { motion } from 'framer-motion'

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسار التنقل" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
      <Link to="/" className="flex items-center gap-1 transition-colors hover:text-primary">
        <Home className="size-3.5" />
        {APP_NAME}
      </Link>
      {items.map((item, i) => {
        const last = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1.5">
            <ChevronLeft className="size-4 text-slate-300" />
            {last || !item.to ? (
              <span className={last ? 'font-semibold text-ink' : ''}>{item.label}</span>
            ) : (
              <Link to={item.to} className="transition-colors hover:text-primary">
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}

/** عنوان قسم موحّد */
export function SectionTitle({
  title,
  subtitle,
  icon,
}: {
  title: string
  subtitle?: string
  icon?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      className="mb-6 flex items-start gap-3"
    >
      {icon && (
        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-xl font-black text-ink sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
    </motion.div>
  )
}