// أنواع البيانات الأساسية للمنصة

export type Plan = 'free' | 'pro' | 'gold'
export type EntityType =
  | 'doctor'
  | 'clinic'
  | 'hospital'
  | 'health_center'
  | 'pharmacy'
  | 'lab'
  | 'radiology'

export interface City {
  id: string
  name: string
  slug: string
  lat: number | null
  lng: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EntityBase {
  id: string
  city_id: string | null
  name: string
  slug: string
  description: string | null
  phone: string | null
  whatsapp: string | null
  address: string | null
  lat: number | null
  lng: number | null
  image: string | null
  images: string[] | null
  is_verified: boolean
  is_active: boolean
  plan: Plan
  plan_expires_at: string | null
  view_count: number
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Doctor extends EntityBase {
  specialty: string | null
  specialty_category_id: string | null
  gender: 'male' | 'female' | null
  bio: string | null
  experience_years: number | null
  certifications: string[] | null
  services: string[] | null
  work_hours: WorkHours | null
  video_url: string | null
  gallery: string[] | null
  rating: number | null
  is_featured?: boolean
}

export interface Clinic extends EntityBase {
  specialty: string | null
  services: string[] | null
  work_hours: WorkHours | null
  gallery: string[] | null
}

export interface Hospital extends EntityBase {
  departments: string[] | null
  services: string[] | null
  work_hours: WorkHours | null
  emergency_phone: string | null
}

export interface HealthCenter extends EntityBase {
  departments: string[] | null
  services: string[] | null
  work_hours: WorkHours | null
}

export interface Pharmacy extends EntityBase {
  services: string[] | null
  opening_hours: string | null
}

export interface DutyPharmacy {
  id: string
  pharmacy_id: string | null
  city_id: string | null
  start_date: string
  end_date: string
  duty_hours: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  pharmacy?: Pharmacy | null
}

export interface Lab extends EntityBase {
  services: string[] | null
  tests: string[] | null
  opening_hours: string | null
}

export interface RadiologyCenter extends EntityBase {
  services: string[] | null
  machines: string[] | null
  opening_hours: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  type: string
  sort_order: number
  created_at: string
}

export interface Article {
  id: string
  title: string
  slug: string
  category_id: string | null
  image: string | null
  excerpt: string | null
  content: string
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  view_count: number
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export interface NewsItem {
  id: string
  title: string
  slug: string
  image: string | null
  excerpt: string | null
  content: string
  is_published: boolean
  published_at: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export interface MedicalQuestion {
  id: string
  question: string
  answer: string
  category_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  keywords?: string[]
}

export interface MedicalKeyword {
  id: string
  question_id: string
  keyword: string
}

export interface SubscriptionRequest {
  id: string
  entity_id: string
  entity_type: EntityType
  current_plan: Plan
  requested_plan: Plan
  phone: string | null
  notes: string | null
  status: 'new' | 'contacting' | 'awaiting_payment' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Statistic {
  id: string
  event_type: string
  entity_type: string | null
  entity_id: string | null
  path: string | null
  created_at: string
}

export interface AppSetting {
  id: string
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface Advertisement {
  id: string
  title: string
  description: string | null
  image: string | null
  link: string | null
  placement: string
  is_active: boolean
  expires_at: string | null
  sort_order: number
  clicks: number
  created_at: string
  updated_at: string
}

export interface AboutInfo {
  content?: string
  support_phone?: string
  support_email?: string
}

export interface DeveloperInfo {
  name?: string
  title?: string
  phone?: string
  international_phone?: string
  instagram?: string
  facebook?: string
}

export interface SiteSettings {
  subscriptions_enabled?: boolean
  notification_email?: string
  about?: AboutInfo
  developer?: DeveloperInfo
}

export interface Profile {
  id: string
  is_admin: boolean
  name: string | null
  created_at: string
}

// ساعات الدوام: { "sat": [{ open: "09:00", close: "17:00" }] } أو نص مبسط
export type WorkHours = Record<string, string | null> | null

export interface SearchGroupResult {
  type: string
  items: Array<Record<string, unknown>>
}

export interface MapMarkerData {
  id: string
  name: string
  entityType: EntityType
  lat: number
  lng: number
  phone: string | null
  address: string | null
  image: string | null
  specialty?: string | null
  slug?: string
}