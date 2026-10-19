import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, MessageCircle, MapPin, Clock, BadgeCheck, Monitor, Siren, Star, CalendarClock, ArrowLeft, User, Share2, ChevronDown, BellRing, CalendarX, } from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '@/components/ui/BrandIcons';
import { useEntity } from '@/hooks/useEntities';
import { ENTITY_TABLES } from '@/services/content';
import { dayLabel } from '@/services/appointments';
import { subscribePush } from '@/services/push';
import { trackBooking, fetchBookingStatus, allTrackedBookings, } from '@/services/bookingStatus';
import { FullPageLoader, ErrorState } from '@/components/ui/States';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { VerifiedBadge, PlanBadge } from '@/components/ui/Badge';
import { InteractiveMap } from '@/components/shared/Map';
import { Dialog } from '@/components/ui/Dialog';
import { Field, Input } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { getPublicUrl } from '@/lib/supabase';
import { waLink, mapsLink, cn, effectivePlan } from '@/lib/utils';
import { ENTITY_LABELS } from '@/constants';
import { EntityIcon } from '@/components/ui/EntityIcon';
import { track, incrementViewCount } from '@/services/stats';
import { Seo } from '@/components/seo/Seo';
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo';
const DAY_ORDER = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
const DAY_NAMES = {
    sat: 'السبت', sun: 'الأحد', mon: 'الاثنين', tue: 'الثلاثاء',
    wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة',
};
// شريط الأيام: 14 يوماً قادمة (اليوم أولاً — RTL يجعله في أقصى اليمين)
const JS_DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
function buildDayStrip() {
    const out = [];
    const base = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
        out.push({
            iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
            dayNum: String(d.getDate()).padStart(2, '0'),
            dayName: d.toLocaleDateString('ar', { weekday: 'long' }),
            isToday: i === 0,
            key: JS_DAY_KEYS[d.getDay()],
        });
    }
    return out;
}
function monthLabelOf(iso) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('ar', { month: 'long', year: 'numeric' });
}
/** توليد الأوقات المتاحة كل 15 دقيقة من نص دوام اليوم — يفهم الصيغ العربية (من 5 الى 9 مساءا، 9 صباحا حتى 12 _ من 4 مساءا حتى 7...) */
const AM_WORDS = new Set(['صباحا', 'صباح']);
const PM_WORDS = new Set(['مساءا', 'مساء', 'ظهرا', 'ليلا', 'عصرا']);
function to24(n, period) {
    if (period === 'pm')
        return n < 12 ? n + 12 : 24;
    if (period === 'am')
        return n === 12 ? 12 : n;
    return n;
}
function slotsForHours(text) {
    const raw = (text ?? '').trim();
    if (!raw || raw.includes('مغلق') || raw.includes('إجازة'))
        return [];
    let s = raw.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    s = s.replace(/لل/g, 'الى').replace(/حتى|حى/g, 'الى');
    s = s.replace(/[-–—]\s*من/g, '_من').replace(/\sو\s/g, '_').replace(/\sمن\s/g, ' _ ');
    const chunks = s.split(/_+/).map((c) => c.trim()).filter(Boolean);
    const set = new Set();
    for (const chunk of chunks) {
        const tokens = [...chunk.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(صباحا|صباح|مساءا|مساء|ظهرا|ليلا|عصرا)?/g)]
            .map((m) => ({ h: +m[1], min: m[2] ? +m[2] : 0, p: m[3] || null }))
            .filter((tk) => tk.h <= 23 && tk.min <= 59);
        if (tokens.length < 2)
            continue;
        const [a, b] = tokens;
        const segPeriod = [a.p, b.p].find((p) => p && PM_WORDS.has(p)) ? 'pm' : [a.p, b.p].find((p) => p && AM_WORDS.has(p)) ? 'am' : null;
        // في مقطع مسائي بلا وصف على البداية: إن كانت البداية >= النهاية رقمياً فهي صباحية (من 11 الى 2 ظهرا = 11:00)
        const sa = a.p ? (PM_WORDS.has(a.p) ? 'pm' : 'am') : (segPeriod === 'pm' && a.h >= b.h ? 'am' : segPeriod);
        const sb = b.p ? (PM_WORDS.has(b.p) ? 'pm' : 'am') : segPeriod;
        let start = to24(a.h, sa) * 60 + a.min;
        let end = to24(b.h, sb) * 60 + b.min;
        if (end < start)
            end += 12 * 60;
        if (segPeriod === null && start <= 7 * 60 && end > start) {
            start += 12 * 60;
            end += 12 * 60;
        }
        if (end <= start || start < 0 || end > 24 * 60 || end - start > 20 * 60)
            continue;
        for (let x = start; x < end; x += 15) {
            set.add(`${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`);
        }
    }
    return [...set].sort();
}
function Section({ title, children }) {
    return (_jsx(Card, { children: _jsxs(CardBody, { children: [_jsxs("h2", { className: "mb-4 flex items-center gap-2 text-lg font-black text-ink", children: [_jsx("span", { className: "h-6 w-1 rounded-full bg-primary" }), title] }), children] }) }));
}
/** شريط الحالة المباشرة لطلب الموعد — يعرض ما وصله من نظام العيادة لحظياً */
function BookingStatusLine({ booking }) {
    const s = booking?.status ?? 'pending';
    const tone = s === 'confirmed' ? 'border-success/40 bg-emerald-50 text-emerald-800'
        : s === 'rejected' || s === 'cancelled' ? 'border-wine/40 bg-wine-soft text-error'
            : s === 'done' ? 'border-border bg-subtle text-muted'
                : 'border-gold/40 bg-gold-soft text-gold-dark';
    const label = s === 'confirmed' ? 'تم تأكيد موعدك في العيادة ✓'
        : s === 'rejected' ? 'لم يُقبل الطلب — اختر وقتاً آخر'
            : s === 'cancelled' ? 'أُلغي الموعد — تواصل مع العيادة'
                : s === 'done' ? 'تمت الزيارة'
                    : s === 'new' ? 'الطلب قيد المراجعة في العيادة'
                        : 'بانتظار رد العيادة…';
    return (_jsxs("div", { className: cn('mx-auto mt-3 flex max-w-sm items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold', tone), children: [_jsx("span", { className: cn('size-2 shrink-0 rounded-full', s === 'confirmed' ? 'bg-success' : s === 'rejected' || s === 'cancelled' ? 'bg-error' : 'bg-gold-dark') }), label] }));
}
function Chips({ items, color }) {
    if (!items?.length)
        return null;
    return (_jsx("div", { className: "flex flex-wrap gap-2", children: items.map((it) => (_jsx("span", { className: "rounded-xl border border-primary/15 bg-primary-light/40 px-3 py-1.5 text-xs font-semibold text-primary-dark", style: color ? { backgroundColor: `${color}14`, color, borderColor: `${color}33` } : undefined, children: it }, it))) }));
}
function WorkHoursTable({ hours }) {
    if (!hours)
        return null;
    return (_jsx("div", { className: "divide-y divide-border rounded-2xl border border-border overflow-hidden", children: DAY_ORDER.map((d) => {
            if (!(d in hours))
                return null;
            return (_jsxs("div", { className: "flex items-center justify-between bg-surface px-4 py-2.5 text-sm", children: [_jsx("span", { className: "font-semibold text-ink", children: DAY_NAMES[d] }), _jsx("span", { className: cn('font-medium', String(hours[d]).includes('مغلق') || String(hours[d]).includes('إجازة') ? 'text-error' : 'text-primary'), children: hours[d] ?? '—' })] }, d));
        }) }));
}
export function EntityDetailPage({ type, title }) {
    const { slug } = useParams();
    const { data, isLoading, isError, refetch } = useEntity(type, slug);
    const [imgError, setImgError] = useState(false);
    const [ready, setReady] = useState(data);
    const toast = useToast();
    const [apptOpen, setApptOpen] = useState(false);
    const [apptDay, setApptDay] = useState('');
    const [apptTime, setApptTime] = useState('');
    const [apptDateISO, setApptDateISO] = useState('');
    const [takenTimes, setTakenTimes] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [bookedInfo, setBookedInfo] = useState(null);
    const [bookingStatus, setBookingStatus] = useState(null);
    const [apptName, setApptName] = useState('');
    const [apptPhone, setApptPhone] = useState('');
    const [apptSending, setApptSending] = useState(false);
    const [apptDone, setApptDone] = useState(false);
    const [apptNotify, setApptNotify] = useState(true);
    const [apptStep, setApptStep] = useState(1);
    const [prevBooking, setPrevBooking] = useState(null);
    const [checkingPhone, setCheckingPhone] = useState(false);
    const submitAppointment = async (e) => {
        e.preventDefault();
        if (!ready)
            return;
        if (!apptDay) {
            toast.show('اختر اليوم المناسب', 'error');
            return;
        }
        if (!apptName.trim() || !apptPhone.trim()) {
            toast.show('أدخل الاسم ورقم الهاتف', 'error');
            return;
        }
        if (!apptTime) {
            toast.show('اختر الوقت المناسب', 'error');
            return;
        }
        setApptSending(true);
        try {
            const res = await fetch('/api/book-appointment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    doctor_id: String(ready.id),
                    date: apptDateISO,
                    time: apptTime,
                    name: apptName.trim(),
                    phone: apptPhone.trim(),
                }),
            });
            const d = await res.json().catch(() => ({}));
            // حجز نشط واحد فقط لكل مواطن — يشمل ما سجّله الطبيب مباشرة من العيادة
            if (d.error === 'has_booking') {
                showPrevBooking(d.booking);
                return;
            }
            if (res.status === 409 || d.error === 'taken') {
                toast.show(d.message || 'عذراً، هذا الوقت حُجز للتو — اختر وقتاً آخر', 'error');
                setApptTime('');
                setApptStep(1);
                if (apptDateISO)
                    setTakenTimes((prev) => (prev.includes(apptTime) ? prev : [...prev, apptTime]));
                return;
            }
            if (!res.ok || !d.ok) {
                toast.show(d.message || 'تعذر إتمام الحجز، حاول مجدداً', 'error');
                return;
            }
            // نجاح: فوري (مؤكد في نظام العيادة) أو احتياطي (طلب للمراجعة)
            setBookedInfo({
                doctor: d.doctor_name || String(ready.name ?? ''),
                dateLabel: d.date_label || apptDateShort,
                time: apptTime,
                instant: d.mode === 'instant',
                requestId: d.request_id ? String(d.request_id) : null,
            });
            setApptDone(true);
            void track('appointment_request', { entityType: type, entityId: String(ready.id) });
            // تتبّع الحالة: استقصاء مجاني + إشعار داخل المتصفح عند القبول/الرفض
            if (d.request_id) {
                const id = String(d.request_id);
                trackBooking({
                    id,
                    doctor: d.doctor_name || String(ready.name ?? ''),
                    dateLabel: d.date_label || apptDateShort,
                    time: apptTime,
                });
                setBookingStatus(allTrackedBookings().find((x) => x.id === id) ?? { id, status: 'pending' });
                // «أشعرني» مختار: اطلب الإذن وسجّل اشتراك الدفع ليصله الإشعار حتى والموقع مغلق
                if (apptNotify) {
                    void Notification.requestPermission().then((perm) => {
                        if (perm === 'granted')
                            void subscribePush({ appointmentId: id });
                    });
                }
                else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    // اشتراك صامت لمن فعّلها سابقاً (ليصله أي تحديث مستقبلي دون إزعاج)
                    void subscribePush({ appointmentId: id });
                }
            }
        }
        catch {
            toast.show('تعذر إتمام الحجز، حاول مجدداً', 'error');
        }
        finally {
            setApptSending(false);
        }
    };
    // عرض رسالة «لديك حجز سابق» من بيانات الحجز النشط (من الفحص المسبق أو من الخادم عند الإرسال)
    const showPrevBooking = (b) => {
        setPrevBooking({
            doctor: b?.doctor || String(ready?.name ?? ''),
            dateLabel: b?.date ? new Date(String(b.date) + 'T00:00:00').toLocaleDateString('ar', { day: 'numeric', month: 'long' }) : '',
            time: b?.time || '',
        });
    };
    // تحقق فوري من «حجز نشط واحد لكل مواطن» لحظة إدخال رقم الهاتف (يشمل ما سجّله الطبيب من العيادة)
    const checkPrevBooking = async (phoneValue) => {
        if (phoneValue.replace(/\D/g, '').length < 9)
            return;
        setCheckingPhone(true);
        try {
            const r = await fetch(`/api/check-booking?phone=${encodeURIComponent(phoneValue.trim())}`);
            const d = await r.json().catch(() => null);
            if (d?.has)
                showPrevBooking(d.booking);
        }
        catch { /* التحقق النهائي يحدث عند الإرسال */ }
        finally {
            setCheckingPhone(false);
        }
    };
    // الأوقات المحجوزة فعلياً لهذا اليوم (مواعيد مؤكدة بنظام العيادة + طلبات معلقة)
    useEffect(() => {
        if (!apptDateISO || !ready)
            return;
        let cancelled = false;
        setLoadingSlots(true);
        fetch(`/api/taken-slots?doctor_id=${ready.id}&date=${apptDateISO}`)
            .then((r) => (r.ok ? r.json() : { taken: [] }))
            .then((d) => { if (!cancelled)
            setTakenTimes(Array.isArray(d.taken) ? d.taken : []); })
            .catch(() => { if (!cancelled)
            setTakenTimes([]); })
            .finally(() => { if (!cancelled)
            setLoadingSlots(false); });
        return () => { cancelled = true; };
    }, [apptDateISO, ready?.id]);
    useEffect(() => {
        if (apptTime && takenTimes.includes(apptTime))
            setApptTime('');
    }, [takenTimes, apptTime]);
    // تحديث حالة الحجز لحظياً: استماع لحدث الخدمة + استقصاء عند الحاجة
    useEffect(() => {
        if (!bookedInfo?.requestId)
            return;
        const id = bookedInfo.requestId;
        const sync = () => {
            const b = allTrackedBookings().find((x) => x.id === id);
            if (b)
                setBookingStatus(b);
        };
        const onStatus = (e) => {
            const detail = e.detail;
            if (detail?.id === id)
                sync();
        };
        sync();
        void fetchBookingStatus(id).then(sync);
        window.addEventListener('dalil-booking-status', onStatus);
        const t = setInterval(() => void fetchBookingStatus(id).then(sync), 15000);
        return () => {
            window.removeEventListener('dalil-booking-status', onStatus);
            clearInterval(t);
        };
    }, [bookedInfo?.requestId]);
    useEffect(() => {
        if (data) {
            setReady(data);
            void incrementViewCount(ENTITY_TABLES[type], String(data.id));
            void track('profile_view', { entityType: type, entityId: String(data.id) });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);
    if (isLoading)
        return _jsx(FullPageLoader, { label: "\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0644\u0641\u2026" });
    if (isError || !ready)
        return _jsx("div", { className: "mx-auto max-w-7xl px-4 py-16 sm:px-6", children: _jsx(ErrorState, { message: "\u062A\u0639\u0630\u0631 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0635\u0631.", onRetry: () => void refetch() }) });
    const name = String(ready.name ?? '');
    const specialty = ready.specialty ?? null;
    const description = ready.description ?? ready.bio ?? null;
    const address = ready.address ?? null;
    const phone = ready.phone ?? null;
    const whatsapp = ready.whatsapp ?? null;
    const lat = ready.lat;
    const lng = ready.lng;
    const image = getPublicUrl(ready.image);
    const gallery = (ready.gallery ?? []).map(getPublicUrl).filter(Boolean);
    const videoUrl = ready.video_url ?? null;
    const services = ready.services ?? null;
    const hours = ready.work_hours ?? null;
    const certified = Boolean(ready.is_verified);
    const plan = effectivePlan(ready);
    const rating = ready.rating ? Number(ready.rating) : null;
    // شريط الحجز: الأيام + حالة الفتح + الأوقات المتاحة لليوم المختار
    const stripDays = buildDayStrip();
    const dayOpen = (key) => !hours || !Object.keys(hours).length || Boolean((hours[key] ?? '').trim());
    const daySlots = apptDay ? slotsForHours(String(hours?.[apptDay] ?? '')) : [];
    const apptDateShort = apptDateISO
        ? new Date(apptDateISO + 'T00:00:00').toLocaleDateString('ar', { day: 'numeric', month: 'long' })
        : '';
    const routeLink = `${type === 'health_center' ? 'health-centers' : type === 'radiology' ? 'radiology' : `${type}s`}`;
    const shareUrl = absoluteUrl(`/${routeLink}/${encodeURIComponent(String(ready.slug ?? slug ?? ''))}`);
    // وضع الإجازة: يوقف طلبات المواعيد مؤقتاً ويعرض رسالة على الصفحة
    const vacationUntil = ready.vacation_until ?? null;
    const onVacation = Boolean(type === 'doctor' && vacationUntil && new Date(vacationUntil + 'T23:59:59') >= new Date());
    const vacationLabel = vacationUntil
        ? new Date(vacationUntil + 'T00:00:00').toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' })
        : '';
    // مشاركة صفحة الجهة: لوحة المشاركة الأصلية على الجوال (واتساب وغيره)، أو نسخ الرابط كبديل
    const shareEntity = async () => {
        const shareData = {
            title: name,
            text: `تعرّف على ${name} (${specialty ?? ENTITY_LABELS[type]}) — عبر دليل طيبة الإمام الطبي`,
            url: shareUrl,
        };
        void track('share', { entityType: type, entityId: String(ready.id) });
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                return;
            }
            catch (err) {
                if (err?.name === 'AbortError')
                    return; // أغلق نافذة المشاركة بنفسه
            }
        }
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.show('تم نسخ رابط الصفحة — يمكنك إرساله لأي شخص');
        }
        catch {
            toast.show('تعذر نسخ الرابط', 'error');
        }
    };
    const schema = [
        {
            '@context': 'https://schema.org',
            '@type': type === 'doctor' ? 'Physician' : 'MedicalBusiness',
            name: name ?? undefined,
            description: description ?? undefined,
            image: image ?? undefined,
            address: { '@type': 'PostalAddress', addressLocality: 'طيبة الإمام', addressCountry: 'SY' },
            phone: phone ?? undefined,
            hasMap: lat && lng ? mapsLink(lat, lng, address) : undefined,
        },
        breadcrumbSchema([
            { label: 'الرئيسية', url: absoluteUrl('/') },
            { label: title, url: absoluteUrl(`/${routeLink}`) },
            { label: name },
        ]),
    ];
    return (_jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8 sm:px-6", children: [_jsx(Seo, { title: name, description: description ?? name, image: image, path: `/${routeLink}/${encodeURIComponent(slug ?? "")}`, type: "profile", jsonLd: schema }), _jsx("div", { className: "mb-6", children: _jsx(Breadcrumbs, { items: [
                        { label: title, to: `/${routeLink}` },
                        { label: name },
                    ] }) }), _jsxs("div", { className: "mb-6 overflow-hidden rounded-[18px] border border-border bg-surface shadow-[var(--shadow-card)]", children: [_jsx("div", { className: "h-28 w-full bg-gradient-to-l from-primary to-primary-dark sm:h-36" }), _jsxs("div", { className: "px-5 pb-5 pt-0 sm:px-8", children: [_jsxs("div", { className: "-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end", children: [_jsxs("div", { className: "flex items-end gap-3", children: [_jsx("div", { className: cn('flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-primary-light text-primary-dark shadow-lg sm:size-32', imgError || !image ? 'relative' : ''), children: image && !imgError ? (_jsx("img", { src: image, alt: name, onError: () => setImgError(true), className: "h-full w-full object-cover" })) : (_jsx(EntityIcon, { type: type, className: "size-12" })) }), type === 'doctor' && (whatsapp || phone) ? (_jsx("a", { href: whatsapp ? waLink(whatsapp, `مرحباً، أود الاستفسار من ${name}`) : `tel:${phone}`, target: whatsapp ? "_blank" : undefined, rel: "noopener noreferrer", title: "تواصل مع الطبيب", className: "flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-green-600 shadow-sm transition hover:border-green-500 hover:bg-green-50", children: whatsapp ? _jsx(MessageCircle, { className: "size-5" }) : _jsx(Phone, { className: "size-5" }) })) : null] }), _jsxs("div", { className: "flex-1 pb-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("h1", { className: "text-2xl font-black text-ink sm:text-3xl", children: name }), certified && _jsx(VerifiedBadge, {}), plan !== 'free' && _jsx(PlanBadge, { plan: plan }), (ready.facebook || ready.instagram) ? _jsxs("div", { className: "flex items-center gap-1.5", children: [ready.facebook ? _jsx("a", { href: String(ready.facebook), target: "_blank", rel: "noopener noreferrer", title: "فيسبوك", className: "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:border-primary hover:bg-primary-light hover:text-primary", dir: "ltr" }, _jsx(FacebookIcon, { className: "size-4" })) : null, ready.instagram ? _jsx("a", { href: String(ready.instagram), target: "_blank", rel: "noopener noreferrer", title: "إنستغرام", className: "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:border-primary hover:bg-primary-light hover:text-primary", dir: "ltr" }, _jsx(InstagramIcon, { className: "size-4" })) : null] }) : null, _jsx("button", { onClick: () => void shareEntity(), title: "\u0645\u0634\u0627\u0631\u0643\u0629 \u0647\u0630\u0647 \u0627\u0644\u062C\u0647\u0629", "aria-label": "\u0645\u0634\u0627\u0631\u0643\u0629", className: "ms-auto flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-muted transition hover:border-primary hover:bg-primary-light hover:text-primary", children: _jsx(Share2, { className: "size-4.5" }) })] }), _jsxs("p", { className: "mt-1 flex items-center gap-2 text-sm font-semibold text-primary-dark", children: [_jsx("span", { className: "rounded-full bg-primary-light px-3 py-1 text-xs font-bold", children: specialty ?? ENTITY_LABELS[type] }), rating ? (_jsxs("span", { className: "flex items-center gap-1 text-sm font-bold text-gold-dark", children: [_jsx(Star, { className: "size-4 fill-gold text-gold-dark" }), rating.toFixed(1)] })) : null] }), address && (_jsxs("p", { className: "mt-1.5 flex items-center gap-1.5 text-sm text-muted", children: [_jsx(MapPin, { className: "size-4 text-primary" }), address] }))] })] }), onVacation && (_jsxs("div", { className: "mt-6 flex items-center gap-3 rounded-2xl border border-gold/50 bg-gold-soft/70 px-4 py-3.5", children: [_jsx("span", { className: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold text-primary-dark", children: _jsx(CalendarClock, { className: "size-5" }) }), _jsxs("div", { children: [_jsxs("p", { className: "text-sm font-black text-gold-dark", children: ["\u0627\u0644\u0637\u0628\u064A\u0628 \u0641\u064A \u0625\u062C\u0627\u0632\u0629 \u062D\u062A\u0649 ", vacationLabel] }), _jsx("p", { className: "text-xs text-muted", children: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0645\u062A\u0648\u0642\u0641\u0629 \u0645\u0624\u0642\u062A\u0627\u064B \u2014 \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0647\u0627\u062A\u0641\u064A\u0627\u064B \u0623\u0648 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628 \u0644\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631." })] })] })), (phone || whatsapp || type === 'doctor') && (_jsxs("div", { className: "mt-6 flex flex-col gap-3 sm:flex-row", children: [phone && (_jsx(Button, { size: "lg", onClick: () => void track('phone_click', { entityType: type, entityId: String(ready.id) }), asChild: true, children: _jsxs("a", { href: `tel:${phone}`, className: "!w-full sm:!flex-1", children: [_jsx(Phone, { className: "size-5 shrink-0" }), "\u0627\u062A\u0635\u0627\u0644"] }) })), whatsapp && (_jsx(Button, { size: "lg", variant: "whatsapp", onClick: () => void track('whatsapp_click', { entityType: type, entityId: String(ready.id) }), asChild: true, children: _jsxs("a", { href: waLink(whatsapp, `مرحباً، أود الاستفسار من ${name}`), target: "_blank", rel: "noopener noreferrer", className: "!w-full sm:!flex-1", children: [_jsx(MessageCircle, { className: "size-5 shrink-0" }), "\u0648\u0627\u062A\u0633\u0627\u0628"] }) })), type === 'doctor' && (_jsxs(Button, { size: "lg", variant: "secondary", disabled: plan === 'free' || onVacation, title: onVacation ? 'الطبيب في إجازة حالياً — طلبات المواعيد متوقفة مؤقتاً' : plan === 'free' ? 'طلبات المواعيد متاحة للأطباء المشتركين في باقة مدفوعة — اشترك من صفحة الباقات لتفعيلها' : undefined, onClick: () => { if (plan !== 'free' && !onVacation) {
                                            const d0 = buildDayStrip().find((d) => !hours || !Object.keys(hours).length || Boolean((hours[d.key] ?? '').trim())) ?? buildDayStrip()[0];
                                            setApptOpen(true);
                                            setApptDone(false);
                                            setApptStep(1);
                                            setApptDay(d0.key);
                                            setApptDateISO(d0.iso);
                                            setApptTime('');
                                            setPrevBooking(null);
                                        } }, className: cn('!w-full sm:!flex-1 bg-none bg-gradient-to-l from-gold to-gold-dark text-primary-dark font-black shadow-lg shadow-gold/40 hover:brightness-105 hover:text-primary-dark border border-gold-dark/30', plan === 'free' && 'cursor-not-allowed'), children: [_jsx(CalendarClock, { className: "size-5 shrink-0" }), "\u0637\u0644\u0628 \u0645\u0648\u0639\u062F"] }))] }))] })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [_jsxs("div", { className: "space-y-6 lg:col-span-2", children: [description && (_jsx(Section, { title: "\u0646\u0628\u0630\u0629", children: _jsx("p", { className: "whitespace-pre-line text-sm leading-7 text-muted", children: description }) })), type === 'doctor' && ready.certifications?.length ? (_jsx(Section, { title: "\u0627\u0644\u0634\u0647\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0624\u0647\u0644\u0627\u062A", children: _jsx("ul", { className: "space-y-2.5", children: ready.certifications.map((c, i) => (_jsxs("li", { className: "flex items-start gap-2 text-sm text-muted", children: [_jsx(BadgeCheck, { className: "mt-0.5 size-4 shrink-0 text-success" }), c] }, i))) }) })) : null, type !== 'doctor' && type !== 'pharmacy' && type !== 'lab' && type !== 'radiology' && ready.departments?.length ? (_jsx(Section, { title: "\u0627\u0644\u0623\u0642\u0633\u0627\u0645", children: _jsx(Chips, { items: ready.departments }) })) : null, services?.length ? (_jsx(Section, { title: type === 'lab' ? 'الخدمات والتحاليل' : type === 'radiology' ? 'الخدمات والأجهزة' : 'الخدمات', children: _jsx("div", { className: "flex flex-wrap gap-2", children: services.map((s) => (_jsx("span", { className: "rounded-xl bg-subtle border border-border px-3 py-1.5 text-xs font-semibold text-ink", children: s }, s))) }) })) : null, type === 'lab' && ready.tests?.length ? (_jsx(Section, { title: "\u0627\u0644\u062A\u062D\u0627\u0644\u064A\u0644", children: _jsx(Chips, { items: ready.tests }) })) : null, type === 'radiology' && ready.machines?.length ? (_jsx(Section, { title: "\u0627\u0644\u0623\u062C\u0647\u0632\u0629", children: _jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: ready.machines.map((m) => (_jsxs("div", { className: "flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink", children: [_jsx(Monitor, { className: "size-4 text-primary" }), m] }, m))) }) })) : null, gallery.length > 0 && (_jsx(Section, { title: "\u0645\u0639\u0631\u0636 \u0627\u0644\u0635\u0648\u0631", children: _jsx("div", { className: "grid grid-cols-3 gap-3", children: gallery.map((g) => (_jsx("a", { href: g ?? '#', target: "_blank", rel: "noopener noreferrer", className: "group overflow-hidden rounded-2xl", children: _jsx("img", { src: g ?? '', alt: "", loading: "lazy", className: "aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105" }) }, g))) }) })), videoUrl && (_jsx(Section, { title: "\u0641\u064A\u062F\u064A\u0648 \u062A\u0639\u0631\u064A\u0641\u064A", children: _jsx("div", { className: "aspect-video overflow-hidden rounded-2xl", children: _jsx("iframe", { src: videoUrl, title: "\u0641\u064A\u062F\u064A\u0648 \u062A\u0639\u0631\u064A\u0641\u064A", className: "h-full w-full", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", loading: "lazy" }) }) }))] }), _jsxs("div", { className: "space-y-6", children: [_jsx(Section, { title: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644", children: _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "flex items-center justify-between rounded-xl bg-subtle px-4 py-3", children: [_jsx("span", { className: "text-muted", children: "\u0627\u0644\u0647\u0627\u062A\u0641" }), _jsx("a", { href: `tel:${phone}`, className: "font-bold text-primary", dir: "ltr", children: phone ?? '—' })] }), ready.emergency_phone ? (_jsxs("div", { className: "flex items-center justify-between rounded-xl bg-wine-soft px-4 py-3", children: [_jsxs("span", { className: "flex items-center gap-1.5 font-bold text-error", children: [_jsx(Siren, { className: "size-4" }), "\u0627\u0644\u0637\u0648\u0627\u0631\u0626"] }), _jsx("a", { href: `tel:${ready.emergency_phone}`, className: "font-bold text-error", dir: "ltr", children: String(ready.emergency_phone) })] })) : null, whatsapp ? (_jsxs("div", { className: "flex items-center justify-between rounded-xl bg-subtle px-4 py-3", children: [_jsx("span", { className: "text-muted", children: "\u0648\u0627\u062A\u0633\u0627\u0628" }), _jsx("a", { href: waLink(whatsapp), target: "_blank", rel: "noopener noreferrer", className: "font-bold text-primary", dir: "ltr", children: whatsapp })] })) : null, ready.facebook ? (_jsxs("div", { className: "flex items-center justify-between rounded-xl bg-subtle px-4 py-3", children: [_jsx("span", { className: "text-muted", children: "\u0641\u064A\u0633\u0628\u0648\u0643" }), _jsx("a", { href: String(ready.facebook), target: "_blank", rel: "noopener noreferrer", className: "font-bold text-primary truncate max-w-[60%]", dir: "ltr", children: String(ready.facebook) })] })) : null, ready.instagram ? (_jsxs("div", { className: "flex items-center justify-between rounded-xl bg-subtle px-4 py-3", children: [_jsx("span", { className: "text-muted", children: "\u0627\u0646\u0633\u062A\u063A\u0631\u0627\u0645" }), _jsx("a", { href: String(ready.instagram), target: "_blank", rel: "noopener noreferrer", className: "font-bold text-primary truncate max-w-[60%]", dir: "ltr", children: String(ready.instagram) })] })) : null, _jsxs("div", { className: "flex items-start justify-between gap-3 rounded-xl bg-subtle px-4 py-3", children: [_jsx("span", { className: "text-muted", children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646" }), _jsx("span", { className: "text-left font-semibold text-ink", children: address ?? '—' })] }), ready.opening_hours && (_jsxs("div", { className: "flex items-center justify-between rounded-xl bg-subtle px-4 py-3", children: [_jsxs("span", { className: "flex items-center gap-1.5 text-muted", children: [_jsx(Clock, { className: "size-4" }), "\u0627\u0644\u062F\u0648\u0627\u0645"] }), _jsx("span", { className: "font-semibold text-ink", children: String(ready.opening_hours) })] }))] }) }), type === 'doctor' && ready.experience_years ? (_jsx(Section, { title: "\u0627\u0644\u062E\u0628\u0631\u0629", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "flex size-14 items-center justify-center rounded-2xl bg-primary-light text-2xl font-black text-primary-dark", children: Number(ready.experience_years) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-ink", children: "\u0633\u0646\u0629 \u062E\u0628\u0631\u0629" }), _jsx("p", { className: "text-xs text-muted", children: "\u0641\u064A \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0629 \u0627\u0644\u0637\u0628\u064A\u0629" })] })] }) })) : null, hours && Object.keys(hours).length > 0 ? (_jsx(Section, { title: "\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u062F\u0648\u0627\u0645", children: _jsx(WorkHoursTable, { hours: hours }) })) : null, _jsxs(Section, { title: type === 'doctor' ? 'موقع الطبيب' : 'الموقع', children: [_jsx(InteractiveMap, { height: "260px", markers: lat && lng ? [{ id: String(ready.id), name, entityType: type, lat, lng, phone, address, image: ready.image, specialty, slug }] : [], zoom: 15 }), (lat && lng) ? (_jsxs("a", { href: mapsLink(lat, lng, address), target: "_blank", rel: "noopener noreferrer", onClick: () => void track('map_click', { entityType: type, entityId: String(ready.id) }), className: "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-light/40 px-4 py-2.5 text-sm font-bold text-primary-dark transition hover:bg-primary-light", children: [_jsx(MapPin, { className: "size-4" }), "\u0639\u0631\u0636 \u0639\u0644\u0649 \u0627\u0644\u062E\u0631\u064A\u0637\u0629"] })) : null] })] })] }), type === 'doctor' && (_jsx(Dialog, { open: apptOpen, onClose: () => setApptOpen(false), title: `طلب موعد — ${name}`, children: prevBooking ? (_jsxs("div", { className: "py-6 text-center", children: [_jsx("span", { className: "mx-auto flex size-14 items-center justify-center rounded-full bg-rose-50 text-error", children: _jsx(CalendarX, { className: "size-7" }) }), _jsx("h3", { className: "mt-4 text-lg font-black text-ink", children: "\u0646\u0639\u062A\u0630\u0631 \u0645\u0646\u0643. \u0644\u062F\u064A\u0643 \u062D\u062C\u0632 \u0645\u0633\u0628\u0642 \u0641\u064A \u0627\u0644\u062F\u0644\u064A\u0644" }), _jsxs("div", { className: "mx-auto mt-4 max-w-sm rounded-2xl border border-border bg-subtle px-5 py-4 text-start", children: [_jsxs("p", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted", children: "\u0627\u0644\u0637\u0628\u064A\u0628" }), _jsx("span", { className: "font-bold text-ink", children: prevBooking.doctor })] }), prevBooking.dateLabel && (_jsxs("p", { className: "mt-2 flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted", children: "\u0627\u0644\u064A\u0648\u0645 \u0648\u0627\u0644\u062A\u0627\u0631\u064A\u062E" }), _jsx("span", { className: "font-bold text-ink", children: prevBooking.dateLabel })] })), prevBooking.time && (_jsxs("p", { className: "mt-2 flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted", children: "\u0627\u0644\u0633\u0627\u0639\u0629" }), _jsx("span", { className: "font-bold text-ink", dir: "ltr", children: prevBooking.time })] }))] }), _jsx("p", { className: "mx-auto mt-4 max-w-sm text-sm leading-7 text-muted", children: "\u0644\u0627 \u064A\u0645\u0643\u0646 \u062D\u062C\u0632 \u0623\u0643\u062B\u0631 \u0645\u0646 \u0645\u0648\u0639\u062F \u0648\u0627\u062D\u062F. \u0644\u062A\u0639\u062F\u064A\u0644 \u0645\u0648\u0639\u062F\u0643 \u0623\u0648 \u0625\u0644\u063A\u0627\u0626\u0647 \u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0639\u064A\u0627\u062F\u0629 \u0647\u0627\u062A\u0641\u064A\u0627\u064B." }), _jsx(Button, { variant: "outline", className: "mt-5", onClick: () => { setPrevBooking(null); setApptOpen(false); }, children: "\u0625\u063A\u0644\u0627\u0642" })] })) : apptDone ? (_jsxs("div", { className: "py-6 text-center", children: [_jsx("span", { className: `mx-auto flex size-14 items-center justify-center rounded-full ${bookedInfo?.instant ? 'bg-emerald-50 text-success' : 'bg-primary-light text-primary-dark'}`, children: _jsx(CalendarClock, { className: "size-7" }) }), _jsx("h3", { className: "mt-4 text-lg font-black text-ink", children: bookedInfo?.instant ? 'تم الحجز بنجاح ✓' : 'تم إرسال طلب موعدك' }), bookedInfo?.instant ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mx-auto mt-3 max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 text-start", children: [_jsxs("p", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted", children: "\u0627\u0644\u0637\u0628\u064A\u0628" }), _jsx("span", { className: "font-bold text-ink", children: bookedInfo.doctor })] }), _jsxs("p", { className: "mt-2 flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted", children: "\u0627\u0644\u064A\u0648\u0645 \u0648\u0627\u0644\u062A\u0627\u0631\u064A\u062E" }), _jsx("span", { className: "font-bold text-ink", children: bookedInfo.dateLabel })] }), _jsxs("p", { className: "mt-2 flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted", children: "\u0627\u0644\u0633\u0627\u0639\u0629" }), _jsx("span", { className: "font-bold text-ink", dir: "ltr", children: bookedInfo.time })] })] }), _jsxs("p", { className: "mx-auto mt-3 max-w-sm text-sm leading-7 text-muted", children: ["\u0645\u0648\u0639\u062F\u0643 \u0645\u0624\u0643\u062F \u0641\u064A \u0646\u0638\u0627\u0645 \u0627\u0644\u0639\u064A\u0627\u062F\u0629 \u2014 \u0627\u062D\u062A\u0641\u0638 \u0628\u0647\u0630\u0627 \u0627\u0644\u0648\u0642\u062A. \u0644\u062A\u0639\u062F\u064A\u0644\u0647 \u0623\u0648 \u0625\u0644\u063A\u0627\u0626\u0647 \u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0639\u064A\u0627\u062F\u0629 \u0647\u0627\u062A\u0641\u064A\u0627\u064B", _jsxs("span", { className: "font-bold text-ink", dir: "ltr", children: [" ", apptPhone ? '' : ''] }), "."] })] })) : (_jsxs("p", { className: "mx-auto mt-2 max-w-sm text-sm leading-7 text-muted", children: ["\u0648\u0635\u0644 \u0637\u0644\u0628\u0643 \u0625\u0644\u0649 ", name, " \u0648\u0633\u064A\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0639\u0644\u0649 \u0631\u0642\u0645\u0643", _jsxs("span", { className: "font-bold text-ink", dir: "ltr", children: [" ", apptPhone] }), " \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0645\u0648\u0639\u062F."] })), bookedInfo?.requestId && !bookedInfo.instant && _jsx(BookingStatusLine, { booking: bookingStatus }), _jsx("div", { className: "mx-auto mt-4 max-w-sm", children: _jsxs("button", { type: "button", onClick: () => {
                                    const id = bookedInfo?.requestId;
                                    if (!id)
                                        return;
                                    void Notification.requestPermission().then((perm) => {
                                        if (perm === 'granted') {
                                            void subscribePush({ appointmentId: id }).then(() => toast.show('مفعّل — سيصلك إشعار فوري عند قبول أو رفض طلبك', 'success'));
                                        }
                                    });
                                }, className: "flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-light/40 px-4 py-2.5 text-sm font-bold text-primary-dark transition hover:bg-primary-light", children: [_jsx(BellRing, { className: "size-4" }), "\u0641\u0639\u0651\u0644 \u0625\u0634\u0639\u0627\u0631 \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0639\u062F"] }) }), _jsx(Button, { variant: "outline", className: "mt-5", onClick: () => { setApptOpen(false); setApptDone(false); setApptStep(1); setApptDay(''); setApptTime(''); setApptDateISO(''); setApptName(''); setApptPhone(''); setApptDateISO(''); setBookedInfo(null); }, children: "\u0625\u063A\u0644\u0627\u0642" })] })) : (_jsxs("form", { onSubmit: submitAppointment, className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-center gap-2", "aria-hidden": "true", children: [[1, 2].map((n) => (_jsxs("span", { className: cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black transition', apptStep === n ? 'bg-primary text-white' : 'bg-subtle text-muted'), children: [n === 1 ? _jsx(CalendarClock, { className: "size-3.5" }) : _jsx(User, { className: "size-3.5" }), n === 1 ? 'الموعد' : 'بياناتك'] }, n))), _jsx("span", { className: cn('h-0.5 w-6 rounded-full transition', apptStep === 2 ? 'bg-primary' : 'bg-subtle-strong') })] }), apptStep === 1 ? (_jsxs(_Fragment, { children: [_jsxs("p", { className: "rounded-xl bg-subtle px-4 py-3 text-xs leading-6 text-muted", children: ["\u0647\u0630\u0647 \u062E\u062F\u0645\u0629 ", _jsx("strong", { className: "text-ink", children: "\u0637\u0644\u0628 \u0645\u0648\u0639\u062F" }), " \u2014 \u064A\u0635\u0644 \u0637\u0644\u0628\u0643 \u0625\u0644\u0649 \u0627\u0644\u0637\u0628\u064A\u0628 \u0644\u064A\u0624\u0643\u062F\u0647\u060C \u0648\u0633\u062A\u062A\u0645 \u062A\u0633\u0648\u064A\u0629 \u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0645\u0639\u0643\u0645 \u0647\u0627\u062A\u0641\u064A\u0627\u064B \u0623\u0648 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628."] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("p", { className: "text-lg font-black text-ink", children: monthLabelOf(apptDateISO || stripDays[0].iso) }), _jsx(ChevronDown, { className: "size-4 text-muted" })] }), _jsx("div", { className: "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", children: stripDays.map((d) => {
                                        const open = dayOpen(d.key);
                                        const selected = apptDateISO === d.iso;
                                        return (_jsxs("button", { type: "button", disabled: !open, onClick: () => { setApptDateISO(d.iso); setApptDay(d.key); setApptTime(''); }, className: cn('flex h-28 w-[68px] shrink-0 flex-col items-center justify-center gap-2.5 rounded-[30px] border transition', selected
                                                ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25'
                                                : open
                                                    ? 'cursor-pointer border-transparent bg-subtle text-ink hover:bg-subtle-strong/60'
                                                    : 'cursor-not-allowed border-transparent bg-subtle/40 text-muted/50'), children: [_jsx("span", { className: "text-[13px] font-bold", children: d.isToday ? 'اليوم' : d.dayName }), _jsx("span", { className: cn('flex size-9 items-center justify-center rounded-full text-base font-black', selected && 'bg-white text-primary-dark'), children: d.dayNum })] }, d.iso));
                                    }) }), _jsxs("div", { className: "rounded-2xl bg-subtle/70 p-4", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-black text-ink", children: "\u0627\u0644\u0623\u0648\u0642\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629" }), daySlots.length > 0 && _jsxs("p", { className: "text-sm font-bold text-muted", children: [daySlots.length, " \u0627\u0644\u0623\u0648\u0642\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629"] })] }), daySlots.length > 0 ? (loadingSlots ? (_jsxs("div", { className: "flex items-center justify-center py-6 text-xs font-bold text-muted", children: [_jsx("span", { className: "me-2 size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" }), "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0623\u0648\u0642\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629\u2026"] })) : (_jsx("div", { className: "grid grid-cols-3 gap-2", children: daySlots.map((s) => {
                                                const taken = takenTimes.includes(s);
                                                const selected = apptTime === s;
                                                return (_jsxs("button", { type: "button", disabled: taken, onClick: () => setApptTime(s), className: cn('rounded-xl border py-2 text-sm font-black transition', taken
                                                        ? 'cursor-not-allowed border-rose-200 bg-rose-50 text-rose-400'
                                                        : selected
                                                            ? 'border-primary bg-primary text-white ring-2 ring-primary/25'
                                                            : 'cursor-pointer border-transparent bg-surface text-ink hover:border-primary/40'), dir: "ltr", children: [_jsx("span", { className: "block", children: s }), _jsx("span", { className: cn('block text-[9px] font-bold leading-3', taken ? 'text-rose-400' : selected ? 'text-white/80' : 'text-slate-300'), children: taken ? 'محجوز' : 'متاح' })] }, s));
                                            }) }))) : (_jsx(Field, { label: "\u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0645\u0641\u0636\u0644 (\u062A\u0642\u0631\u064A\u0628\u064A)", hint: "\u0623\u0648\u0642\u0627\u062A \u062F\u0648\u0627\u0645 \u0627\u0644\u0637\u0628\u064A\u0628 \u063A\u064A\u0631 \u0645\u062D\u062F\u062F\u0629 \u0628\u062F\u0642\u0629 \u0644\u0647\u0630\u0627 \u0627\u0644\u064A\u0648\u0645 \u2014 \u0627\u0643\u062A\u0628 \u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0644\u0643", children: _jsx(Input, { value: apptTime, onChange: (e) => setApptTime(e.target.value), placeholder: "\u0645\u062B\u0627\u0644: 10:00 \u0635\u0628\u0627\u062D\u0627\u064B" }) })), daySlots.length === 0 && hours && Object.keys(hours).length > 0 && (_jsx("p", { className: "mt-2 text-[11px] text-muted", children: "\u0623\u064A\u0627\u0645 \u062F\u0648\u0627\u0645 \u0627\u0644\u0637\u0628\u064A\u0628 \u0641\u0642\u0637 \u2014 \u0627\u0644\u0623\u064A\u0627\u0645 \u0627\u0644\u0631\u0645\u0627\u062F\u064A\u0629 \u0645\u063A\u0644\u0642\u0629." }))] }), _jsxs(Button, { type: "button", className: "w-full", disabled: !apptDay || loadingSlots || (daySlots.length > 0 && !apptTime), onClick: () => setApptStep(2), children: ["\u0627\u0644\u062A\u0627\u0644\u064A", _jsx(ArrowLeft, { className: "size-4" })] })] })) : (_jsxs(_Fragment, { children: [_jsxs("button", { type: "button", onClick: () => setApptStep(1), className: "flex w-full cursor-pointer items-center justify-between rounded-xl border border-primary/20 bg-primary-light/30 px-4 py-3 text-right transition hover:border-primary/50", children: [_jsxs("span", { className: "flex items-center gap-2 text-sm font-bold text-primary-dark", children: [_jsx(CalendarClock, { className: "size-4" }), dayLabel(apptDay), apptTime ? ` — الساعة ${apptTime}` : '', apptDateShort ? ` (${apptDateShort})` : '', apptDateShort ? ` (${apptDateShort})` : ''] }), _jsx("span", { className: "text-[11px] font-bold text-primary hover:underline", children: "\u062A\u0639\u062F\u064A\u0644" })] }), _jsxs("div", { className: "grid gap-4", children: [_jsx(Field, { label: "\u0627\u0644\u0627\u0633\u0645", required: true, children: _jsx(Input, { value: apptName, onChange: (e) => setApptName(e.target.value), placeholder: "\u0627\u0633\u0645\u0643 \u0627\u0644\u0643\u0631\u064A\u0645" }) }), _jsx(Field, { label: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", required: true, hint: checkingPhone ? 'جارٍ التحقق من حجوزاتك السابقة…' : undefined, children: _jsx(Input, { type: "tel", value: apptPhone, onChange: (e) => setApptPhone(e.target.value), onBlur: (e) => void checkPrevBooking(e.target.value), placeholder: "09xx xxx xxx", dir: "ltr", disabled: checkingPhone }) })] }), _jsxs("label", { className: "flex cursor-pointer items-start gap-2.5 rounded-xl border border-primary/20 bg-primary-light/30 px-4 py-3", children: [_jsx("input", { type: "checkbox", className: "mt-0.5 size-4 accent-[#428177]", checked: apptNotify, onChange: (e) => setApptNotify(e.target.checked) }), _jsxs("span", { className: "text-xs leading-6 text-muted", children: [_jsx("strong", { className: "text-ink", children: "\u0623\u0628\u0644\u063A\u0646\u064A \u0639\u0646\u062F \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628" }), " \u2014 \u0625\u0634\u0639\u0627\u0631 \u0645\u062A\u0635\u0641\u062D \u064A\u0635\u0644\u0643 \u0641\u0648\u0631 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0637\u0628\u064A\u0628 \u0644\u0644\u0645\u0648\u0639\u062F (\u062D\u062A\u0649 \u0648\u0623\u0646\u062A \u062E\u0627\u0631\u062C \u0627\u0644\u0645\u0648\u0642\u0639)."] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { type: "submit", loading: apptSending, className: "flex-1", children: [_jsx(CalendarClock, { className: "size-4" }), "\u062D\u062C\u0632 \u0645\u0648\u0639\u062F"] }), _jsx(Button, { type: "button", variant: "outline", onClick: () => setApptStep(1), children: "\u0627\u0644\u0633\u0627\u0628\u0642" })] })] }))] })) }))] }));
}
