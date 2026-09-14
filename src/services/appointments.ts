import { supabase } from '@/lib/supabase'

export type AppointmentStatus = 'new' | 'confirmed' | 'rejected' | 'done'

export interface AppointmentRequest {
  id: string
  doctor_id: string
  doctor_name: string | null
  patient_name: string
  patient_phone: string
  preferred_day: string
  preferred_time: string | null
  note: string | null
  status: AppointmentStatus
  created_at: string
}

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  new: 'جديد',
  confirmed: 'مؤكد',
  rejected: 'مرفوض',
  done: 'منجز',
}

export const APPOINTMENT_DAYS: { key: string; label: string }[] = [
  { key: 'sat', label: 'السبت' },
  { key: 'sun', label: 'الأحد' },
  { key: 'mon', label: 'الاثنين' },
  { key: 'tue', label: 'الثلاثاء' },
  { key: 'wed', label: 'الأربعاء' },
  { key: 'thu', label: 'الخميس' },
  { key: 'fri', label: 'الجمعة' },
]

export const dayLabel = (key: string): string =>
  APPOINTMENT_DAYS.find((d) => d.key === key)?.label ?? key

/** المواطن يرسل طلب موعد (مسموح للزوار) — يُعيد معرّف الطلب عند النجاح */
export async function createAppointmentRequest(v: {
  doctor_id: string
  doctor_name?: string | null
  patient_name: string
  patient_phone: string
  preferred_day: string
  preferred_time?: string | null
  note?: string | null
}): Promise<string | null> {
  const { data, error } = await supabase.from('appointment_requests').insert(v).select('id').single()
  if (error) return null
  return (data?.id as string) ?? null
}

/** طلبات المواعيد الخاصة بالطبيب صاحب الجلسة (عبر توكن لوحة الجهة) */
export async function fetchDoctorAppointments(token: string): Promise<AppointmentRequest[]> {
  const { data, error } = await supabase.rpc('doctor_appointments', { p_token: token })
  if (error) return []
  return (data ?? []) as AppointmentRequest[]
}

/** الطبيب يحدد حالة طلب خاص به */
export async function setDoctorAppointmentStatus(
  token: string,
  id: string,
  status: AppointmentStatus,
): Promise<boolean> {
  const { data, error } = await supabase.rpc('doctor_appointment_set_status', {
    p_token: token,
    p_id: id,
    p_status: status,
  })
  if (error) return false
  return Boolean(data)
}

/** الإدارة: كل الطلبات */
export async function fetchAllAppointments(): Promise<AppointmentRequest[]> {
  const { data, error } = await supabase
    .from('appointment_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300)
  if (error) return []
  return (data ?? []) as AppointmentRequest[]
}

/** الإدارة: تحديث حالة */
export async function adminSetAppointmentStatus(id: string, status: AppointmentStatus): Promise<boolean> {
  const { error } = await supabase.from('appointment_requests').update({ status }).eq('id', id)
  return !error
}
