import { SPECIALTIES } from '@/constants'

export interface EntityMeta {
  type: string
  label: string
  publicRoute: string
}

export const ENTITY_META: Record<string, EntityMeta> = {
  doctors: { type: 'doctor', label: 'الأطباء', publicRoute: 'doctors' },
  clinics: { type: 'clinic', label: 'العيادات', publicRoute: 'clinics' },
  hospitals: { type: 'hospital', label: 'المشافي', publicRoute: 'hospitals' },
  health_centers: { type: 'health_center', label: 'المراكز الصحية', publicRoute: 'health-centers' },
  pharmacies: { type: 'pharmacy', label: 'الصيدليات', publicRoute: 'pharmacies' },
  labs: { type: 'lab', label: 'المخابر', publicRoute: 'labs' },
  radiology_centers: { type: 'radiology', label: 'مراكز الأشعة', publicRoute: 'radiology' },
}

export const enumValues = {
  specialties: SPECIALTIES,
  plans: ['free', 'pro', 'gold'],
}