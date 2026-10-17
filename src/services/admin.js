import { supabase } from '@/lib/supabase';
import { ENTITY_TABLES } from '@/services/content';
export const BUCKET = 'medical';
const BUCKET_FOLDERS = {
    doctor: 'doctors',
    clinic: 'clinics',
    hospital: 'hospitals',
    health_center: 'health_centers',
    pharmacy: 'pharmacies',
    lab: 'labs',
    radiology: 'radiology',
};
export const ADMIN_TABLE_LAYOUT = {
    doctors: { label: 'الأطباء', type: 'doctor' },
    clinics: { label: 'العيادات', type: 'clinic' },
    hospitals: { label: 'المشافي', type: 'hospital' },
    health_centers: { label: 'المراكز الصحية', type: 'health_center' },
    pharmacies: { label: 'الصيدليات', type: 'pharmacy' },
    labs: { label: 'المخابر', type: 'lab' },
    radiology_centers: { label: 'مراكز الأشعة', type: 'radiology' },
};
export async function getCurrentProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
        return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error)
        return null;
    return data;
}
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
}
export async function signOut() {
    await supabase.auth.signOut();
}
/** ضغط الصور وتحسينها قبل الرفع */
export async function compressImage(file, maxSize = 1200, quality = 0.82) {
    const img = await createImageBitmap(file);
    const w = Math.min(img.width, maxSize);
    const h = Math.round((img.height * w) / img.width);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob)
                return reject(new Error('تعذر ضغط الصورة'));
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
    });
}
export async function uploadImage(entity, file) {
    return uploadToFolder(BUCKET_FOLDERS[entity], file);
}
/** رفع صورة داخل مجلد مخصّص (مثل ads / articles) مع ضغط مسبق */
export async function uploadToFolder(folder, file) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const name = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = `${folder}/${name}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (error)
        throw error;
    return path;
}
export async function deleteImage(path) {
    if (!path || path.startsWith('http') || path.startsWith('/'))
        return;
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error)
        console.warn('فشل حذف الصورة', error);
}
export async function createEntity(type, values) {
    const table = ENTITY_TABLES[type];
    const { data, error } = await supabase.from(table).insert(values).select().single();
    return { data, error };
}
export async function updateEntity(type, id, values) {
    const table = ENTITY_TABLES[type];
    const { data, error } = await supabase.from(table).update(values).eq('id', id).select().single();
    return { data, error };
}
export async function deleteEntity(type, id) {
    const table = ENTITY_TABLES[type];
    const { error } = await supabase.from(table).delete().eq('id', id);
    return !error;
}
export async function fetchSubscriptionRequests() {
    const { data, error } = await supabase
        .from('subscription_requests')
        .select('*')
        .order('created_at', { ascending: false });
    if (error)
        return [];
    return (data ?? []);
}
/** ترجمة أخطاء قاعدة البيانات التقنية إلى رسائل مفهومة للمدير */
function friendlyAccountError(msg) {
    const m = (msg || '').toLowerCase();
    if (m.includes('duplicate key') || m.includes('unique')) {
        return 'تعارض في البريد مع حساب آخر — أعد المحاولة وسيولّد بريد فريد جديد';
    }
    if (m.includes('jwt') || m.includes('permission') || m.includes('row-level security')) {
        return 'انتهت جلسة المشرف — أعد تسجيل الدخول ثم حاول مجدداً';
    }
    return msg;
}
/** تفعيل/إعادة تفعيل تجربة شهر مجاني لطبيب — كل تفعيل يمدد شهراً من الآن وينشئ بيانات دخول جديدة */
export async function startDoctorTrial(doctorId, plan) {
    const { data, error } = await supabase.rpc('start_doctor_trial', { p_doctor_id: doctorId, p_plan: plan });
    if (error)
        return { ok: false, error: friendlyAccountError(error.message) };
    return (data ?? null);
}
/** إنشاء/تجديد حساب جهة (كلمة سر ورابط سحري جديدان) — يُستخدم عند الموافقة وعند إعادة إرسال البيانات */
export async function ensureEntityAccount(entityType, entityId) {
    const table = ENTITY_TABLES[entityType];
    if (!table)
        return { ok: false, accountError: 'نوع جهة غير صالح' };
    const { data: ent } = await supabase.from(table).select('slug, name').eq('id', entityId).maybeSingle();
    // البريد يجب أن يكون فريداً عالمياً: نستخدم السلاغ اللاتيني إن وجد، وندائماً نلحق جزءاً من المعرف
    // (السلاغ العربي يفرغ عند التعقيم، وبغير المعرف تتكرر القيمة ويفشل قيد البريد الفريد)
    const rawSlug = String(ent?.slug ?? '');
    const latinSlug = rawSlug.replace(/[^a-z0-9.-]/gi, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
    const idPart = entityId.replace(/-/g, '').slice(0, 8);
    const email = `admin-${latinSlug || 'entity'}-${idPart}@gmail.com`;
    const password = genEntityPassword();
    const { data: acct, error: acctErr } = await supabase.rpc('entity_create_account', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_email: email,
        p_password: password,
    });
    const a = acct;
    if (acctErr)
        return { ok: true, slug: rawSlug, name: ent?.name ?? '', accountError: friendlyAccountError(acctErr.message) };
    if (!a || a.error)
        return { ok: true, slug: rawSlug, name: ent?.name ?? '', accountError: friendlyAccountError(String(a?.error ?? 'تعذر إنشاء الحساب')) };
    return {
        ok: true,
        email: a.email ?? email,
        password,
        slug: rawSlug,
        name: a.name ?? ent?.name ?? '',
        linkToken: a.magic_token ?? undefined,
    };
}
export async function updateRequestStatus(id, status, notes) {
    const { data: req, error: fetchErr } = await supabase
        .from('subscription_requests')
        .select('*')
        .eq('id', id)
        .single();
    if (fetchErr || !req)
        return { ok: false };
    const updates = { status, notes: notes ?? req.notes };
    if (status === 'approved' && req.requested_plan) {
        updates.current_plan = req.requested_plan;
    }
    const { error } = await supabase.from('subscription_requests').update(updates).eq('id', id);
    if (error)
        return { ok: false };
    // تطبيق الخطة المطلوبة فعلياً على جهة (الطبيب/العيادة/…) عند الموافقة — لمدة شهر واحد
    if (status === 'approved') {
        const table = ENTITY_TABLES[req.entity_type];
        if (table) {
            const { error: entErr } = await supabase
                .from(table)
                .update({
                plan: req.requested_plan,
                plan_expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
            })
                .eq('id', req.entity_id);
            if (entErr)
                return { ok: false };
            // إنشاء حساب الجهة تلقائياً: البريد وكلمة السر والرابط السحري تُسلَّم للإدارة لتمريرها للجهة
            const res = await ensureEntityAccount(req.entity_type, req.entity_id);
            if (res.accountError)
                return { ...res, accountError: res.accountError };
            return res;
        }
    }
    return { ok: true };
}
export async function createSubscriptionRequest(v) {
    const { error } = await supabase.from('subscription_requests').insert(v);
    return !error;
}
/** متابعة حالة طلب الترقية برقم الهاتف (دالة آمنة في قاعدة البيانات) */
export async function checkRequestStatus(phone) {
    const { data, error } = await supabase.rpc('request_status_by_phone', { p_phone: phone.trim() });
    if (error)
        return null;
    return (data ?? null);
}
export const REQUEST_STATUS_LABELS = {
    new: 'قيد المراجعة',
    contacting: 'تم التواصل معك',
    awaiting_payment: 'بانتظار الدفع',
    approved: 'تمت الموافقة',
    rejected: 'مرفوض',
};
/** الطلبات التي ما تزال قيد المعالجة (لمنع التكرار) */
export const PENDING_REQUEST_STATUSES = ['new', 'contacting', 'awaiting_payment'];
export async function fetchSettings() {
    const { data, error } = await supabase.from('app_settings').select('*').eq('key', 'site');
    if (error || !data?.length)
        return {};
    return (data[0].value ?? {});
}
export async function saveSettings(values) {
    const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'site', value: values }, { onConflict: 'key' });
    return !error;
}
export async function fetchAdminUsers() {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at');
    if (error)
        return [];
    return (data ?? []);
}
/** توليد كلمة سر عشوائية قوية (خاصة بجهة واحدة ولا تُعاد) */
export function genEntityPassword(len = 16) {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    let out = '';
    for (let i = 0; i < len; i++)
        out += charset[arr[i] % charset.length];
    return out;
}
export async function fetchAdminStats() {
    const stats = {
        entities: {},
        articles: 0,
        questions: 0,
        unanswered: 0,
        requests: 0,
        plans: { free: 0, pro: 0, gold: 0 },
    };
    for (const table of Object.keys(ADMIN_TABLE_LAYOUT)) {
        const { count } = await supabase
            .from(table)
            .select('id', { count: 'exact', head: true });
        stats.entities[table] = count ?? 0;
        const plan = await supabase.from(table).select('plan');
        if (!plan.error && plan.data) {
            for (const p of plan.data) {
                if (p.plan === 'free' || p.plan === 'pro' || p.plan === 'gold')
                    stats.plans[p.plan]++;
            }
        }
    }
    const art = await supabase.from('articles').select('id', { count: 'exact', head: true });
    stats.articles = art.count ?? 0;
    const qs = await supabase.from('medical_questions').select('id', { count: 'exact', head: true });
    stats.questions = qs.count ?? 0;
    const un = await supabase.from('unanswered_questions').select('id', { count: 'exact', head: true });
    stats.unanswered = un.count ?? 0;
    const req = await supabase.from('subscription_requests').select('id', { count: 'exact', head: true });
    stats.requests = req.count ?? 0;
    return stats;
}
