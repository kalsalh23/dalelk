import { supabase } from '@/lib/supabase';
export const APPOINTMENT_STATUS_LABELS = {
    new: 'جديد',
    confirmed: 'مؤكد',
    rejected: 'مرفوض',
    done: 'منجز',
};
export const APPOINTMENT_DAYS = [
    { key: 'sat', label: 'السبت' },
    { key: 'sun', label: 'الأحد' },
    { key: 'mon', label: 'الاثنين' },
    { key: 'tue', label: 'الثلاثاء' },
    { key: 'wed', label: 'الأربعاء' },
    { key: 'thu', label: 'الخميس' },
    { key: 'fri', label: 'الجمعة' },
];
export const dayLabel = (key) => APPOINTMENT_DAYS.find((d) => d.key === key)?.label ?? key;
/** المواطن يرسل طلب موعد (مسموح للزوار) — يُعيد معرّف الطلب عند النجاح */
export async function createAppointmentRequest(v) {
    const { data, error } = await supabase.from('appointment_requests').insert(v).select('id').single();
    if (error)
        return null;
    return data?.id ?? null;
}
/** طلبات المواعيد الخاصة بالطبيب صاحب الجلسة (عبر توكن لوحة الجهة) */
export async function fetchDoctorAppointments(token) {
    const { data, error } = await supabase.rpc('doctor_appointments', { p_token: token });
    if (error)
        return [];
    return (data ?? []);
}
/** الطبيب يحدد حالة طلب خاص به */
export async function setDoctorAppointmentStatus(token, id, status) {
    const { data, error } = await supabase.rpc('doctor_appointment_set_status', {
        p_token: token,
        p_id: id,
        p_status: status,
    });
    if (error)
        return false;
    return Boolean(data);
}
/** الإدارة: كل الطلبات */
export async function fetchAllAppointments() {
    const { data, error } = await supabase
        .from('appointment_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(300);
    if (error)
        return [];
    return (data ?? []);
}
/** الإدارة: تحديث حالة */
export async function adminSetAppointmentStatus(id, status) {
    const { error } = await supabase.from('appointment_requests').update({ status }).eq('id', id);
    return !error;
}
