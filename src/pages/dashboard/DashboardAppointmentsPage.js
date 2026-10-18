import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Phone, MessageCircle, RefreshCcw, Check, X, Inbox, CheckCheck, BellRing, } from 'lucide-react';
import { useDashboardSession } from '@/layouts/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeletons } from '@/components/ui/States';
import { Seo } from '@/components/seo/Seo';
import { useToast } from '@/components/ui/Toast';
import { fetchDoctorAppointments, setDoctorAppointmentStatus, dayLabel, APPOINTMENT_STATUS_LABELS, } from '@/services/appointments';
import { readStoredSession, registerEntityPush } from '@/services/entityAccount';
import { acquirePushSubscription } from '@/services/push';
import { formatDate, waLink, cn } from '@/lib/utils';
const TABS = [
    { key: 'all', label: 'الكل' },
    { key: 'new', label: 'جديدة' },
    { key: 'confirmed', label: 'مؤكدة' },
    { key: 'rejected', label: 'مرفوضة' },
    { key: 'done', label: 'منجزة' },
];
const statusStyle = {
    new: 'bg-gold-soft text-gold-dark',
    confirmed: 'bg-primary-light text-primary-dark',
    rejected: 'bg-wine-soft text-error',
    done: 'bg-subtle-strong text-muted',
};
export function DashboardAppointmentsPage() {
    const { session } = useDashboardSession();
    const toast = useToast();
    const [items, setItems] = useState(null);
    const [tab, setTab] = useState('all');
    const [busyId, setBusyId] = useState(null);
    const [pushBusy, setPushBusy] = useState(false);
    const [pushOn, setPushOn] = useState(() => typeof Notification !== 'undefined' && Notification.permission === 'granted');
    const enablePush = async () => {
        const token = readStoredSession()?.token;
        if (!token)
            return;
        setPushBusy(true);
        const sub = await acquirePushSubscription();
        if (typeof sub === 'string') {
            setPushBusy(false);
            if (sub === 'denied')
                toast.show('حظرت المتصفح الإشعارات — فعّلها من إعدادات الموقع', 'error');
            else if (sub === 'unsupported')
                toast.show('متصفحك لا يدعم الإشعارات — أضف الموقع إلى الشاشة الرئيسية أولاً', 'error');
            else
                toast.show('تعذر التفعيل، حاول مجدداً', 'error');
            return;
        }
        const ok = await registerEntityPush(token, sub);
        setPushBusy(false);
        if (ok) {
            setPushOn(true);
            toast.show('مفعّل! ستصلك إشعارات فورية عند وصول أي طلب موعد جديد');
        }
        else {
            toast.show('تعذر تسجيل الاشتراك، حاول مجدداً', 'error');
        }
    };
    const load = async () => {
        const token = readStoredSession()?.token;
        if (!token)
            return;
        const list = await fetchDoctorAppointments(token);
        setItems(list);
    };
    useEffect(() => { void load(); }, []);
    const filtered = useMemo(() => {
        const list = items ?? [];
        return tab === 'all' ? list : list.filter((a) => a.status === tab);
    }, [items, tab]);
    const counts = useMemo(() => {
        const list = items ?? [];
        return {
            all: list.length,
            new: list.filter((a) => a.status === 'new').length,
            confirmed: list.filter((a) => a.status === 'confirmed').length,
            rejected: list.filter((a) => a.status === 'rejected').length,
            done: list.filter((a) => a.status === 'done').length,
        };
    }, [items]);
    const setStatus = async (a, status) => {
        const token = readStoredSession()?.token;
        if (!token)
            return;
        setBusyId(a.id);
        const ok = await setDoctorAppointmentStatus(token, a.id, status);
        setBusyId(null);
        if (ok) {
            setItems((prev) => (prev ?? []).map((x) => (x.id === a.id ? { ...x, status } : x)));
            toast.show(status === 'confirmed' ? 'تم تأكيد الموعد' : status === 'rejected' ? 'تم رفض الطلب' : 'تم تعليمه كمنجز');
        }
        else {
            toast.show('تعذر التحديث، أعد المحاولة', 'error');
        }
    };
    if (!session)
        return null;
    const isDoctor = session.entity_type === 'doctor';
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(Seo, { title: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F", description: "\u0625\u062F\u0627\u0631\u0629 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0648\u0627\u0631\u062F\u0629 \u0645\u0646 \u0627\u0644\u0645\u0631\u0636\u0649" }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F" }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0648\u0627\u0631\u062F\u0629 \u0645\u0646 \u0635\u0641\u062D\u062A\u0643 \u0627\u0644\u0639\u0627\u0645\u0629 \u2014 \u0623\u0643\u0651\u062F\u0647\u0627 \u0648\u0633\u062A\u0638\u0647\u0631 \u0644\u0644\u0645\u0631\u0636\u0649 \u0643\u0645\u0648\u0627\u0639\u064A\u062F \u0645\u0624\u0643\u062F\u0629 \u0628\u0639\u062F \u062A\u0648\u0627\u0635\u0644\u0643\u0645." })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => void load(), loading: items === null, children: [_jsx(RefreshCcw, { className: "size-4" }), " \u062A\u062D\u062F\u064A\u062B"] })] }), isDoctor && (_jsx(Card, { className: cn('border transition', pushOn ? 'border-success/40 bg-emerald-50/60' : 'border-gold/40 bg-gold-soft/50'), children: _jsxs(CardBody, { className: "flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center", children: [_jsx("span", { className: cn('flex size-11 shrink-0 items-center justify-center rounded-2xl', pushOn ? 'bg-success/15 text-success' : 'bg-gold text-primary-dark'), children: _jsx(BellRing, { className: "size-5.5" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-sm font-black text-ink", children: "\u0625\u0634\u0639\u0627\u0631 \u0641\u0648\u0631\u064A \u0639\u0646\u062F \u0648\u0635\u0648\u0644 \u0637\u0644\u0628 \u0645\u0648\u0639\u062F \u062C\u062F\u064A\u062F" }), _jsx("p", { className: "mt-0.5 text-xs leading-6 text-muted", children: pushOn ? 'مفعّل على هذا الجهاز — سيصلك إشعار حتى والموقع مغلق.' : 'فعّل الإشعارات على جهازك ليصلك تنبيه فوري عند إرسال أي مريض طلب موعد.' })] }), !pushOn && (_jsxs(Button, { size: "sm", loading: pushBusy, onClick: () => void enablePush(), children: [_jsx(BellRing, { className: "size-4" }), " \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"] }))] }) })), _jsx("div", { className: "flex flex-wrap gap-2", children: TABS.map((t) => (_jsxs("button", { type: "button", onClick: () => setTab(t.key), className: cn('cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-black transition', tab === t.key ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-muted hover:border-primary/40'), children: [t.label, " ", counts[t.key] ? `(${counts[t.key]})` : ''] }, t.key))) }), items === null ? (_jsx(Skeletons, { rows: 4, box: "!p-5" })) : filtered.length === 0 ? (_jsx(Card, { children: _jsxs(CardBody, { className: "py-14 text-center", children: [_jsx(Inbox, { className: "mx-auto size-10 text-muted" }), _jsx("h2", { className: "mt-4 text-lg font-black text-ink", children: tab === 'all' ? 'لا توجد طلبات مواعيد بعد' : 'لا توجد طلبات في هذه الحالة' }), _jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-muted", children: "\u0639\u0646\u062F \u0625\u0631\u0633\u0627\u0644 \u0645\u0631\u064A\u0636 \u0637\u0644\u0628 \u0645\u0648\u0639\u062F \u0645\u0646 \u0635\u0641\u062D\u062A\u0643 \u0627\u0644\u0639\u0627\u0645\u0629 \u0633\u064A\u0638\u0647\u0631 \u0647\u0646\u0627 \u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u062A\u0624\u0643\u062F\u0647 \u0623\u0648 \u062A\u0631\u0641\u0636\u0647." })] }) })) : (_jsx("div", { className: "space-y-3", children: filtered.map((a) => (_jsx(Card, { className: "p-5", children: _jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start", children: [_jsx("span", { className: "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-dark", children: _jsx(CalendarClock, { className: "size-6" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("p", { className: "font-black text-ink", children: a.patient_name }), _jsx("span", { className: cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold', statusStyle[a.status]), children: APPOINTMENT_STATUS_LABELS[a.status] }), _jsx("span", { className: "text-[11px] text-muted", children: formatDate(a.created_at) })] }), _jsxs("p", { className: "mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted", children: [_jsxs("span", { className: "inline-flex items-center gap-1 font-bold text-ink", children: [_jsx(CalendarClock, { className: "size-3.5 text-primary" }), " ", dayLabel(a.preferred_day)] }), a.preferred_time && _jsxs("span", { children: ["\u0627\u0644\u0648\u0642\u062A \u0627\u0644\u0645\u0641\u0636\u0644: ", a.preferred_time] })] }), a.note && _jsxs("p", { className: "mt-1 text-xs leading-6 text-muted", children: ["\u0645\u0644\u0627\u062D\u0638\u0629 \u0627\u0644\u0645\u0631\u064A\u0636: ", a.note] }), _jsxs("p", { className: "mt-1.5 flex items-center gap-1.5 text-xs text-muted", dir: "ltr", children: [_jsx(Phone, { className: "size-3.5 shrink-0 text-primary" }), " ", a.patient_phone] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", asChild: true, children: _jsxs("a", { href: `tel:${a.patient_phone}`, children: [_jsx(Phone, { className: "size-4" }), " \u0627\u062A\u0635\u0627\u0644"] }) }), _jsx(Button, { size: "sm", variant: "whatsapp", asChild: true, children: _jsxs("a", { href: waLink(a.patient_phone, `مرحباً ${a.patient_name}، بخصوص طلب الموعد لدى عيادتكم يوم ${dayLabel(a.preferred_day)}${a.preferred_time ? ` الساعة ${a.preferred_time}` : ''}`), target: "_blank", rel: "noopener noreferrer", children: [_jsx(MessageCircle, { className: "size-4" }), " \u0648\u0627\u062A\u0633\u0627\u0628"] }) }), a.status === 'new' && (_jsxs(_Fragment, { children: [_jsxs(Button, { size: "sm", loading: busyId === a.id, onClick: () => void setStatus(a, 'confirmed'), children: [_jsx(Check, { className: "size-4" }), " \u062A\u0623\u0643\u064A\u062F"] }), _jsxs(Button, { size: "sm", variant: "danger", loading: busyId === a.id, onClick: () => void setStatus(a, 'rejected'), children: [_jsx(X, { className: "size-4" }), " \u0631\u0641\u0636"] })] })), a.status === 'confirmed' && (_jsxs(Button, { size: "sm", variant: "outline", loading: busyId === a.id, onClick: () => void setStatus(a, 'done'), children: [_jsx(CheckCheck, { className: "size-4" }), " \u062A\u0645 \u0627\u0644\u062D\u0636\u0648\u0631"] }))] })] }) }, a.id))) }))] }));
}
