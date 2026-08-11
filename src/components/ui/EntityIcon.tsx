import type { LucideIcon } from 'lucide-react'
import {
  Stethoscope,
  Building2,
  Hospital,
  Pill,
  Moon,
  FlaskConical,
  ScanLine,
  HeartPulse,
} from 'lucide-react'
import type { EntityType } from '@/types'

const ICONS: Record<string, LucideIcon> = {
  stethoscope: Stethoscope,
  building: Building2,
  hospital: Hospital,
  pill: Pill,
  moon: Moon,
  flask: FlaskConical,
  scan: ScanLine,
  'heart-pulse': HeartPulse,
}

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Stethoscope
  return <Icon className={className ?? 'size-5'} />
}

export function EntityIcon({ type, className }: { type: EntityType; className?: string }) {
  const map: Record<EntityType, LucideIcon> = {
    doctor: Stethoscope,
    clinic: Building2,
    hospital: Hospital,
    pharmacy: Pill,
    health_center: HeartPulse,
    lab: FlaskConical,
    radiology: ScanLine,
  }
  const Icon = map[type] ?? Stethoscope
  return <Icon className={className ?? 'size-5'} />
}

export { ICONS as SERVICE_ICON_MAP }