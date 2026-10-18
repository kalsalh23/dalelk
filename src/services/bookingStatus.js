/* ============================================================
 * إشعار المواطن بحالة طلب موعده — مجاني 100% ضمن المتصفح
 *
 * 1) استقصاء (polling) كل 15 ثانية لنقطة الحالة في نظام العيادة:
 *    GET /api/bridge-request-status?secret=…&platform_ref=…
 *    (لا يحتاج أي إذن من المتصفح — يعمل فوراً عند الحجز)
 * 2) عند تغيّر الحالة (قبول/رفض) يُعرض:
 *      • إشعار داخلي: حدث dalil-booking-status + toast داخل التطبيق
 *      • إشعار خارجي: Notification API — يظهر خارج التبويب/سطح المكتب
 * 3) الطلبات المعلّقة محفوظة في localStorage فيصلك الإشعار
 *    حتى بعد إغلاق الصفحة أو على أي صفحة في الموقع.
 * ============================================================ */
const CLINIC_STATUS_URL = 'https://dashbord-doctor.vercel.app/api/bridge-request-status';
const BRIDGE_SECRET = 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5';
const POLL_MS = 15000;
const STORE_KEY = 'dalil_pending_bookings';
/* ------------------------- التخزين المحلي ------------------------- */
function readStore() {
    if (typeof localStorage === 'undefined')
        return [];
    try {
        const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
        return Array.isArray(raw) ? raw : [];
    }
    catch {
        return [];
    }
}
function writeStore(items) {
    if (typeof localStorage === 'undefined')
        return;
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(items));
    }
    catch {
        /* التخزين ممتلئ — نتابع في الذاكرة فقط */
    }
}
/** تتبّع طلب جديد (يُستدعى بعد نجاح الحجز) */
export function trackBooking(b) {
    const id = String(b.id ?? '').trim();
    if (!id)
        return;
    const items = readStore();
    if (items.some((x) => x.id === id))
        return;
    writeStore([{ id, doctor: b.doctor, dateLabel: b.dateLabel, time: b.time, status: 'pending', updatedAt: Date.now() }, ...items]);
}
/** إيقاف تتبّع طلب (عند رؤية المواطن الحالة النهائية أو إخفاء البطاقة) */
export function untrackBooking(id) {
    writeStore(readStore().filter((x) => x.id !== id));
}
export function pendingBookings() {
    return readStore().filter((x) => x.status === 'pending' || x.status === 'new');
}
export function allTrackedBookings() {
    return readStore();
}
/* --------------------------- الاستقصاء --------------------------- */
/** يجلب حالة طلب واحد من نظام العيادة */
export async function fetchBookingStatus(platformRef) {
    try {
        const r = await fetch(`${CLINIC_STATUS_URL}?secret=${encodeURIComponent(BRIDGE_SECRET)}&platform_ref=${encodeURIComponent(platformRef)}`);
        const j = (await r.json().catch(() => null));
        if (!j || !j.ok)
            return j?.error === 'not_found' ? 'not_found' : 'pending';
        const s = String(j.status || 'new');
        const next = readStore().map((x) => x.id === platformRef ? { ...x, status: s, appointment: j.appointment ?? x.appointment, updatedAt: Date.now() } : x);
        writeStore(next);
        return s;
    }
    catch {
        /* الشبكة غير متاحة — نحاول في الدورة التالية */
        return 'pending';
    }
}
/**
 * دورة استقصاء واحدة على كل الطلبات المعلّقة.
 * تُعيد true إذا وصل تحديث جديد (لتستخدمه الواجهة في إعادة الرسم).
 */
export async function pollPendingBookings() {
    const items = pendingBookings();
    if (items.length === 0)
        return false;
    let changed = false;
    for (const b of items) {
        const before = b.status;
        const s = await fetchBookingStatus(b.id);
        if (s !== before) {
            changed = true;
            if (s === 'confirmed' || s === 'rejected' || s === 'cancelled') {
                notifyCitizen(s, b.id, b);
                // الطلب وصل لحالته النهائية: أُخرجه من المعلّقة (يبقى محفوظاً في السجل)
                writeStore(readStore().map((x) => (x.id === b.id ? { ...x, status: s, updatedAt: Date.now() } : x)));
            }
        }
    }
    return changed;
}
/* --------------------------- الإشعارات --------------------------- */
/** إشعار خارجي مجاني عبر المتصفح + حدث داخلي للواجهة */
export async function notifyCitizen(status, id, meta) {
    // 1) حدث داخلي: يسمع له App/الصفحات فيعرض شارة + toast
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dalil-booking-status', { detail: { id, status, ...meta } }));
    }
    const title = status === 'confirmed'
        ? 'تم تأكيد موعدك ✓'
        : status === 'rejected' || status === 'cancelled'
            ? 'بخصوص طلب موعدك'
            : 'تحديث حالة طلبك';
    let body;
    if (status === 'confirmed') {
        const when = meta?.appointment?.appointment_date
            ? ` يوم ${meta.appointment.appointment_date}${meta.appointment.start_time ? ` الساعة ${meta.appointment.start_time.slice(0, 5)}` : ''}`
            : meta?.time
                ? ` — ${meta.time}`
                : '';
        body = `تم تأكيد موعدك في ${meta?.doctor || 'العيادة'}${when}`;
    }
    else if (status === 'rejected') {
        body = 'لم يُقبل طلب الموعد — يمكنك اختيار وقت آخر أو التواصل مع العيادة.';
    }
    else if (status === 'cancelled') {
        body = 'تم إلغاء موعدك — يرجى التواصل مع العيادة لإعادة الجدولة.';
    }
    else {
        body = 'تم تحديث حالة طلب موعدك — تفضّل بمراجعته.';
    }
    try {
        if (typeof Notification === 'undefined')
            return;
        if (Notification.permission === 'granted') {
            const n = new Notification(title, { body, dir: 'rtl', lang: 'ar', icon: '/favicon.svg', tag: 'booking-' + id });
            n.onclick = () => {
                window.focus();
                window.dispatchEvent(new CustomEvent('dalil-open-bookings'));
            };
            return;
        }
        if (Notification.permission !== 'denied') {
            const perm = await Notification.requestPermission();
            if (perm === 'granted')
                notifyCitizen(status, id, meta);
        }
    }
    catch {
        /* المتصفح لا يدعم إشعارات الويب — الحدث الداخلي يكفي */
    }
}
/* --------------------------- دورة خلفية --------------------------- */
let timer = null;
let started = false;
/** بدء الاستقصاء الخلفي لكل الطلبات المعلّقة (يُستدعى مرة عند تحميل التطبيق) */
export function startBookingTracking(intervalMs = POLL_MS) {
    if (typeof window === 'undefined' || started)
        return;
    started = true;
    void pollPendingBookings();
    timer = setInterval(() => {
        if (document.hidden)
            return; // لا نثقل الجهاز والتبويب مخفي
        void pollPendingBookings();
    }, intervalMs);
    // عند عودة التبويب: استقصاء فوري
    window.addEventListener('focus', () => void pollPendingBookings());
}
export function stopBookingTracking() {
    if (timer)
        clearInterval(timer);
    timer = null;
    started = false;
}
