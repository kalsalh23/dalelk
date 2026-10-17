import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Phone, MessageCircle, RefreshCcw, Check, X, Inbox, } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeletons } from '@/components/ui/States';
import { Seo } from '@/components/seo/Seo';
import { useToast } from '@/components/ui/Toast';
import { fetchAllAppointments, adminSetAppointmentStatus, dayLabel, APPOINTMENT_STATUS_LABELS, } from '@/services/appointments';
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
export function AdminAppointmentsPage() {
    const toast = useToast();
    const [items, setItems] = useState(null);
    const [tab, setTab] = useState('all');
    const [busyId, setBusyId] = useState(null);
    const load = async () => {
        const list = await fetchAllAppointments();
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
        setBusyId(a.id);
        const ok = await adminSetAppointmentStatus(a.id, status);
        setBusyId(null);
        if (ok) {
            setItems((prev) => (prev ?? []).map((x) => (x.id === a.id ? { ...x, status } : x)));
            toast.show('تم تحديث الحالة');
        }
        else {
            toast.show('تعذر التحديث', 'error');
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(Seo, { title: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F", description: "\u0645\u0631\u0627\u0642\u0628\u0629 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0648\u0627\u0631\u062F\u0629 \u0644\u0644\u062C\u0647\u0627\u062A" }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F" }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u0643\u0644 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0648\u0627\u0631\u062F\u0629 \u0645\u0646 \u0635\u0641\u062D\u0627\u062A \u0627\u0644\u0623\u0637\u0628\u0627\u0621 \u2014 \u0644\u0644\u062A\u0623\u0643\u062F \u0623\u0646 \u0627\u0644\u0623\u0637\u0628\u0627\u0621 \u064A\u0633\u062A\u062C\u064A\u0628\u0648\u0646 \u0644\u0647\u0627." })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => void load(), loading: items === null, children: [_jsx(RefreshCcw, { className: "size-4" }), " \u062A\u062D\u062F\u064A\u062B"] })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: TABS.map((t) => (_jsxs("button", { type: "button", onClick: () => setTab(t.key), className: cn('cursor-pointer rounded-xl border px-3.5 py-2 text-xs font-black transition', tab === t.key ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-muted hover:border-primary/40'), children: [t.label, " ", counts[t.key] ? `(${counts[t.key]})` : ''] }, t.key))) }), items === null ? (_jsx(Skeletons, { rows: 4, box: "!p-5" })) : filtered.length === 0 ? (_jsx(Card, { children: _jsxs(CardBody, { className: "py-14 text-center", children: [_jsx(Inbox, { className: "mx-auto size-10 text-muted" }), _jsx("h2", { className: "mt-4 text-lg font-black text-ink", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0637\u0644\u0628\u0627\u062A \u0645\u0648\u0627\u0639\u064A\u062F \u0628\u0639\u062F" }), _jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-muted", children: "\u0639\u0646\u062F \u0625\u0631\u0633\u0627\u0644 \u0623\u064A \u0645\u0631\u064A\u0636 \u0637\u0644\u0628 \u0645\u0648\u0639\u062F \u0645\u0646 \u0635\u0641\u062D\u0629 \u0637\u0628\u064A\u0628 \u0633\u064A\u0638\u0647\u0631 \u0647\u0646\u0627 \u0645\u0628\u0627\u0634\u0631\u0629." })] }) })) : (_jsx("div", { className: "space-y-3", children: filtered.map((a) => (_jsx(Card, { className: "p-5", children: _jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-start", children: [_jsx("span", { className: "flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-dark", children: _jsx(CalendarClock, { className: "size-6" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("p", { className: "font-black text-ink", children: a.doctor_name ?? 'طبيب' }), _jsx("span", { className: cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold', statusStyle[a.status]), children: APPOINTMENT_STATUS_LABELS[a.status] }), _jsx("span", { className: "text-[11px] text-muted", children: formatDate(a.created_at) })] }), _jsxs("p", { className: "mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted", children: [_jsxs("span", { className: "font-bold text-ink", children: ["\u0627\u0644\u0645\u0631\u064A\u0636: ", a.patient_name] }), _jsxs("span", { className: "inline-flex items-center gap-1", children: [_jsx(CalendarClock, { className: "size-3.5 text-primary" }), " ", dayLabel(a.preferred_day)] }), a.preferred_time && _jsxs("span", { children: ["\u0627\u0644\u0648\u0642\u062A: ", a.preferred_time] })] }), a.note && _jsxs("p", { className: "mt-1 text-xs leading-6 text-muted", children: ["\u0645\u0644\u0627\u062D\u0638\u0629: ", a.note] }), _jsxs("p", { className: "mt-1.5 flex items-center gap-1.5 text-xs text-muted", dir: "ltr", children: [_jsx(Phone, { className: "size-3.5 shrink-0 text-primary" }), " ", a.patient_phone] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx(Button, { size: "sm", variant: "whatsapp", asChild: true, children: _jsxs("a", { href: waLink(a.patient_phone, `مرحباً ${a.patient_name}، بخصوص طلب الموعد لدى ${a.doctor_name ?? 'الطبيب'} يوم ${dayLabel(a.preferred_day)}`), target: "_blank", rel: "noopener noreferrer", children: [_jsx(MessageCircle, { className: "size-4" }), " \u0648\u0627\u062A\u0633\u0627\u0628"] }) }), a.status !== 'confirmed' && a.status !== 'done' && (_jsxs(Button, { size: "sm", variant: "outline", loading: busyId === a.id, onClick: () => void setStatus(a, 'confirmed'), children: [_jsx(Check, { className: "size-4" }), " \u062A\u0623\u0643\u064A\u062F"] })), a.status !== 'rejected' && a.status !== 'done' && (_jsxs(Button, { size: "sm", variant: "danger", loading: busyId === a.id, onClick: () => void setStatus(a, 'rejected'), children: [_jsx(X, { className: "size-4" }), " \u0631\u0641\u0636"] })), a.status === 'confirmed' && (_jsx(Button, { size: "sm", variant: "outline", loading: busyId === a.id, onClick: () => void setStatus(a, 'done'), children: "\u062A\u0645 \u0627\u0644\u062D\u0636\u0648\u0631" }))] })] }) }, a.id))) }))] }));
}
