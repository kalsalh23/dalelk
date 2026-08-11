import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Phone, Star, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { VerifiedBadge } from '@/components/ui/Badge'
import { getPublicUrl } from '@/lib/supabase'
import { mapsLink } from '@/lib/utils'
import { MAP_COLORS, ENTITY_LABELS } from '@/constants'
import type { EntityType } from '@/types'
import { EntityIcon } from '@/components/ui/EntityIcon'

export const ENTITY_ROUTES: Record<EntityType, string> = {
  doctor: '/doctors',
  clinic: '/clinics',
  hospital: '/hospitals',
  health_center: '/health-centers',
  pharmacy: '/pharmacies',
  lab: '/labs',
  radiology: '/radiology',
}

export interface EntityCardProps {
  type: EntityType
  item: Record<string, unknown>
  index?: number
  highlight?: boolean
}

export function EntityCard({ type, item, index = 0, highlight }: EntityCardProps) {
  const [imgError, setImgError] = useState(false)
  const navigate = useNavigate()
  const id = String(item.id)
  const name = String(item.name ?? '')
  const slug = String(item.slug ?? '')
  const image = getPublicUrl(item.image as string)
  const verified = Boolean(item.is_verified)
  const specialty = (item.specialty as string) ?? null
  const address = (item.address as string) ?? null
  const phone = (item.phone as string) ?? null
  const rating = item.rating ? Number(item.rating) : null

  const link = `${ENTITY_ROUTES[type]}/${slug || id}`
  const color = MAP_COLORS[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Card
        onClick={() => navigate(link)}
        className={`group relative cursor-pointer overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
          highlight ? 'ring-2 ring-primary/60' : ''
        }`}
      >
        {verified && (
          <VerifiedBadge className="absolute right-3 top-3 z-10 shadow-sm" />
        )}
        <div className="flex gap-4 p-4 sm:p-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-primary-light/50 sm:h-24 sm:w-24">
            {image && !imgError ? (
              <img
                src={image}
                alt={name}
                loading="lazy"
                onError={() => setImgError(true)}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center" style={{ color }}>
                <EntityIcon type={type} className="size-9" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-lg font-bold text-ink transition-colors group-hover:text-primary">
                {name}
              </p>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-muted">
              <span className="inline-block size-2 rounded-full" style={{ backgroundColor: color }} />
              {specialty ?? ENTITY_LABELS[type]}
            </p>
            {type === 'doctor' && item.experience_years ? (
              <p className="mt-0.5 text-xs text-muted">خبرة {Number(item.experience_years)} سنوات</p>
            ) : null}
            {address && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                <MapPin className="size-3.5 shrink-0" />
                <span className="line-clamp-1">{address}</span>
              </p>
            )}
            <div className="mt-2 flex items-center gap-3">
              {rating ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  {Number(rating).toFixed(1)}
                </span>
              ) : null}
              {phone ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-muted" dir="ltr">
                  <Phone className="size-3.5 text-primary" />
                  {phone}
                </span>
              ) : null}
              <Link
                to={mapsLink(item.lat as number, item.lng as number, address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <MapPin className="size-3.5" />
                الموقع
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 pr-1">
            <div
              className="flex size-9 items-center justify-center rounded-full bg-slate-50 text-muted opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-primary hover:text-white"
              style={{ color: undefined }}
            >
              <ArrowLeft className="size-4" />
            </div>
            <span className="text-[10px] font-semibold text-slate-300 sm:hidden">عرض</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}