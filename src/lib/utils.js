import { clsx } from 'clsx';
export function cn(...inputs) {
    return clsx(inputs);
}
export function slugify(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}
export function formatDate(value) {
    if (!value)
        return '—';
    try {
        return new Date(value).toLocaleDateString('ar-SY', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
    catch {
        return '—';
    }
}
export function formatDateShort(value) {
    if (!value)
        return '—';
    try {
        return new Date(value).toLocaleDateString('ar-SY', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    }
    catch {
        return '—';
    }
}
export function telLink(phone) {
    if (!phone)
        return '#';
    const cleaned = phone.replace(/\s/g, '').replace(/^\+/, '');
    return `tel:+${cleaned.startsWith('9') || cleaned.startsWith('0') ? '' : ''}${cleaned}`;
}
export function waLink(phone, text) {
    if (!phone)
        return '#';
    const cleaned = phone.replace(/[^\d]/g, '');
    const full = cleaned.startsWith('963') ? cleaned : `963${cleaned.replace(/^0/, '')}`;
    if (text)
        return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
    return `https://wa.me/${full}`;
}
export function mapsLink(lat, lng, address) {
    if (lat && lng)
        return `https://www.google.com/maps?q=${lat},${lng}`;
    if (address)
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    return '#';
}
export function truncate(text, max = 120) {
    if (!text)
        return '';
    return text.length > max ? `${text.slice(0, max)}…` : text;
}
export function plural(count, singular, pluralWord, plural2) {
    const n = Math.abs(count);
    if (plural2) {
        if (n === 1)
            return singular;
        if (n === 2)
            return plural2;
        return pluralWord;
    }
    if (n === 1)
        return singular;
    return pluralWord;
}
export function countLabel(count) {
    return `${count} ${plural(count, 'عنصر', 'عناصر', 'عنصرين')}`;
}
/** تنسيق رقم الثلاث (1,234) */
export function formatNumber(n) {
    return new Intl.NumberFormat('ar-SY').format(n);
}
export function todaySQL() {
    return new Date().toISOString().slice(0, 10);
}
export const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
/** مدة الاشتراك المدفوع بالأيام (شهر واحد) */
export const PLAN_DURATION_DAYS = 30;
/** تاريخ انتهاء الباقة من الآن */
export function planExpiryFromNow(days = PLAN_DURATION_DAYS) {
    return new Date(Date.now() + days * 24 * 3600 * 1000).toISOString();
}
/** تنسيق وقت الفتح/الإغلاق للصيدلية المناوبة: يفترض مروراً لمنتصف الليل إذا كان الإغلاق قبل الفتح */
export function formatDutyTime(open, close) {
    if (!open && !close)
        return '';
    if (!open)
        return `الإغلاق: ${close}`;
    if (!close)
        return `الافتتاح: ${open}`;
    const o = open.slice(0, 5);
    const c = close.slice(0, 5);
    const crossesMidnight = c < o;
    return crossesMidnight ? `${o} — ${c} (اليوم التالي)` : `${o} — ${c}`;
}
/** هل انتهت صلاحية اشتراك الجهة؟ */
export function isPlanExpired(row) {
    const exp = row?.plan_expires_at;
    if (!exp)
        return false;
    return new Date(exp).getTime() < Date.now();
}
/** الباقة الفعلية المعروضة: ترجع «مجاني» إذا انتهت صلاحية الاشتراك المدفوع */
export function effectivePlan(row) {
    const p = String(row?.plan ?? 'free');
    if ((p === 'pro' || p === 'gold') && isPlanExpired(row))
        return 'free';
    return p;
}
