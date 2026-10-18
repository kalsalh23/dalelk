import { supabase } from '@/lib/supabase';
/** مفتاح تخزين جلسة الجهة محلياً */
export const ENTITY_SESSION_KEY = 'entity_session';
function sanitizeSlug(slug) {
    return slug.toLowerCase().replace(/[^a-z0-9.-]+/g, '-').replace(/^-+|-+$/g, '');
}
/** توليد بريد الجهة: admin-<slug>@gmail.com */
export function buildEntityEmail(slug) {
    return `admin-${sanitizeSlug(slug)}@gmail.com`;
}
/** توليد كلمة سر فريدة على القاعدة dalil@2026<رقم> */
export function buildEntityPassword() {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `dalil@2026${random}`;
}
/** إنشاء حساب جهة (يستدعي RPC — يُسمح للمدير فقط) */
export async function createEntityAccount(entityType, entityId, email, password) {
    const { data, error } = await supabase.rpc('entity_create_account', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_email: email,
        p_password: password,
    });
    if (error || !data?.ok)
        return null;
    return data;
}
/** دخول الجهة — يعيد كائن جلسة أو null عند خطأ */
export async function entityLogin(email, password) {
    const { data, error } = await supabase.rpc('entity_login', {
        p_email: email.trim(),
        p_password: password,
    });
    if (error || !data?.session_token)
        return null;
    const sess = {
        token: data.session_token,
        slug: data.slug,
        email: data.email,
        entity_type: data.entity_type,
    };
    localStorage.setItem(ENTITY_SESSION_KEY, JSON.stringify(sess));
    return sess;
}
/** دخول الجهة عبر الرابط السحري (magic link) — يخص الجهة صاحبة الرابط فقط */
export async function magicLogin(token) {
    const { data, error } = await supabase.rpc('entity_login_magic', { p_token: token });
    if (error || !data?.session_token)
        return null;
    const sess = {
        token: data.session_token,
        slug: data.slug,
        email: data.email,
        entity_type: data.entity_type,
    };
    localStorage.setItem(ENTITY_SESSION_KEY, JSON.stringify(sess));
    return sess;
}
/** توليد رابط لوحة التحكم الكامل مع الرمز السحري */
export function buildMagicLink(slug, magicToken) {
    return `${window.location.origin}/account/${slug}?tk=${encodeURIComponent(magicToken)}`;
}
/** جلب بيانات الجهة للجلسة النشطة */
export async function fetchEntitySession(token) {
    const { data, error } = await supabase.rpc('entity_session', { p_token: token });
    if (error || !data?.entity_id)
        return null;
    return {
        id: data.id,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        slug: data.slug,
        email: data.email,
        entity: (data.entity ?? null),
    };
}
/** تحديث بيانات الجهة من لوحتها */
export async function updateEntityOwn(token, fields) {
    const { data, error } = await supabase.rpc('entity_update_own', {
        p_token: token,
        p_fields: fields,
    });
    return !error && data === true;
}
/** تغيير كلمة سر الجهة (يتطلب معرفة القديمة أو عبر الجلسة) */
export async function changeEntityPassword(token, oldPass, newPass) {
    // لا توجد RPC مخصصة، نستخدم entity_login للتحقق ثم تحديث عبر supabase مباشرة غير متاح للجهة
    // لذا نتحقق أولاً ثم نطلب من الخادم توليد hash جديد عبر rpc مستحدث إن وجد
    // كحل مؤقت: نستخدم RPC غير موجود → سنحتاج ترحيل إضافي. حالياً نعيد false مع رسالة
    // سنطبق التغيير عبر استدعاء supabase.rpc('entity_change_password', ...)
    const { data, error } = await supabase.rpc('entity_change_password', {
        p_token: token,
        p_old_password: oldPass,
        p_new_password: newPass,
    });
    if (!error && data === true)
        return true;
    // fallback: تحقق من كلمة السر القديمة عبر entity_login ثم أنشئ حساباً جديداً بنفس البريد
    const sess = await fetchEntitySession(token);
    if (!sess)
        return false;
    const login = await entityLogin(sess.email, oldPass);
    if (!login)
        return false;
    // إعادة إنشاء الحساب بنفس البريد وكلمة سر جديدة (يتطلب is_admin؟ لا يمكن)
    // لذلك نفشل بصراحة ونطلب من المدير إعادة التعيين
    return false;
}
/** رفع صورة للجهة (يتطلب entity session — يستخدم anon policy الجديد) */
export async function uploadEntityImage(file, folder) {
    const { compressImage, uploadToFolder } = await import('@/services/admin');
    try {
        const compressed = await compressImage(file);
        return await uploadToFolder(folder, compressed);
    }
    catch {
        return null;
    }
}
export const ENTITY_FOLDER = {
    doctor: 'doctors',
    clinic: 'clinics',
    hospital: 'hospitals',
    health_center: 'health_centers',
    pharmacy: 'pharmacies',
    lab: 'labs',
    radiology: 'radiology_centers',
    radiology_centers: 'radiology',
};
export function folderForType(entityType) {
    return ENTITY_FOLDER[entityType] ?? 'entities';
}
export function readStoredSession() {
    try {
        const raw = localStorage.getItem(ENTITY_SESSION_KEY);
        if (!raw)
            return null;
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
export function clearStoredSession() {
    localStorage.removeItem(ENTITY_SESSION_KEY);
}
/** الملف الشخصي للجهة من البيانات الخام */
export function entityDisplayName(entity) {
    return String(entity?.name ?? '');
}
export function entityDisplayType(type) {
    const labels = {
        doctor: 'طبيب',
        clinic: 'عيادة',
        hospital: 'مشفى',
        health_center: 'مركز صحي',
        pharmacy: 'صيدلية',
        lab: 'مخبر',
        radiology: 'مركز أشعة',
    };
    return labels[type] ?? type;
}
/** قائمة أسئلة الطبيب مع خطة باقته والحد المسموح */
export async function doctorQaList(token) {
    const { data } = await supabase.rpc('doctor_qa_list', { p_token: token });
    return (data ?? null);
}
/** إضافة سؤال مع الإجابة وكلمات مفتاحية مفصولة بفاصلة (يفحص الخادم حد الباقة) */
export async function doctorQaAdd(token, question, answer, keywords) {
    const { data } = await supabase.rpc('doctor_qa_add', {
        p_token: token,
        p_question: question,
        p_answer: answer,
        p_keywords: keywords,
    });
    return (data ?? null);
}
/** حذف سؤال يخص الطبيب صاحب الجلسة */
export async function doctorQaDelete(token, id) {
    const { data } = await supabase.rpc('doctor_qa_delete', { p_token: token, p_id: id });
    return (data ?? null);
}
export async function fetchEntityStats(token) {
    const { data } = await supabase.rpc('doctor_stats', { p_token: token });
    return (data ?? null);
}
/* ---------- وضع الإجازة (الأطباء) ---------- */
export async function setVacationUntil(token, until) {
    const { data } = await supabase.rpc('doctor_set_vacation', { p_token: token, p_until: until });
    return (data ?? null);
}
/* ---------- اشتراك دفع الجهة (إشعار الطبيب بالمواعيد الجديدة) ---------- */
export async function registerEntityPush(token, sub) {
    const { data } = await supabase.rpc('entity_push_register', {
        p_token: token,
        p_endpoint: sub.endpoint,
        p_p256dh: sub.p256dh,
        p_auth: sub.auth,
    });
    return Boolean(data?.ok);
}
export async function unregisterEntityPush(token, endpoint) {
    const { data } = await supabase.rpc('entity_push_unregister', { p_token: token, p_endpoint: endpoint });
    return Boolean(data?.ok);
}
