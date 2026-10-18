import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Send, PhoneCall, BadgeCheck, CreditCard, KeyRound, Crown, Sparkles, RefreshCw, Lock, Inbox, ArrowUpRight, } from 'lucide-react';
import { fetchSiteSettings } from '@/services/site';
import { createSubscriptionRequest, checkRequestStatus, REQUEST_STATUS_LABELS, PENDING_REQUEST_STATUSES, } from '@/services/admin';
import { fetchEntities } from '@/services/content';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { Skeletons } from '@/components/ui/States';
import { ENTITY_LABELS } from '@/constants';
import { Seo } from '@/components/seo/Seo';
import { cn, formatDate } from '@/lib/utils';
const TYPE_OPTIONS = Object.keys(ENTITY_LABELS).map((k) => ({
    value: k,
    label: ENTITY_LABELS[k],
}));
const NEXT_STEPS = [
    { icon: PhoneCall, title: 'نتواصل معك', text: 'تتواصل معك إدارة المنصة على الرقم الذي أدخلته للتأكيد وترتيب الاشتراك.' },
    { icon: BadgeCheck, title: 'الموافقة والتفعيل', text: 'بعد الموافقة تُفعّل باقتك لمدة شهر كامل من تاريخ الموافقة.' },
    { icon: KeyRound, title: 'استلام بيانات لوحتك', text: 'تصلك بيانات دخول لوحة تحكم جهتك لتدير ملفك وصورك بنفسك.' },
];
const statusStyle = {
    new: 'bg-gold-soft text-gold-dark',
    contacting: 'bg-primary-light text-primary-dark',
    awaiting_payment: 'bg-gold-soft text-gold-dark',
    approved: 'bg-primary text-white',
    rejected: 'bg-wine-soft text-error',
};
function StatusCard({ r }) {
    const pending = r.status ? PENDING_REQUEST_STATUSES.includes(r.status) : false;
    return (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-black text-ink", children: r.entity_name ?? 'جهتك' }), _jsxs("p", { className: "mt-0.5 text-xs text-muted", children: ["\u0637\u0644\u0628 \u0628\u0627\u0642\u0629 ", r.requested_plan === 'gold' ? 'ذهبية' : 'احترافية', " \u2014 ", formatDate(r.created_at ?? null)] })] }), _jsx("span", { className: cn('rounded-full px-3.5 py-1.5 text-xs font-black', statusStyle[r.status ?? 'new'] ?? 'bg-subtle-strong text-muted'), children: REQUEST_STATUS_LABELS[r.status ?? ''] ?? r.status })] }), r.status === 'approved' && (_jsx("p", { className: "rounded-xl bg-primary-light/50 px-4 py-3 text-xs leading-6 text-primary-dark", children: "\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0637\u0644\u0628\u0643 \u0648\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0628\u0627\u0642\u0629 \u0644\u0645\u062F\u0629 \u0634\u0647\u0631 \u2014 \u062A\u062D\u0642\u0642 \u0645\u0646 \u0635\u0641\u062D\u062A\u0643\u060C \u0648\u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u0644\u0648\u062D\u062A\u0643 \u0648\u0635\u0644\u062A\u0643 \u0645\u0646 \u0627\u0644\u0625\u062F\u0627\u0631\u0629." })), pending && (_jsx("p", { className: "rounded-xl bg-subtle px-4 py-3 text-xs leading-6 text-muted", children: "\u0637\u0644\u0628\u0643 \u0645\u0627 \u064A\u0632\u0627\u0644 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \u2014 \u0644\u0627 \u062F\u0627\u0639\u064A \u0644\u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0622\u062E\u0631\u060C \u0633\u0646\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0639\u0644\u0649 \u0631\u0642\u0645\u0643 \u0641\u064A \u0623\u0642\u0631\u0628 \u0648\u0642\u062A." })), r.status === 'rejected' && (_jsx("p", { className: "rounded-xl bg-wine-soft px-4 py-3 text-xs leading-6 text-error", children: "\u062A\u0645 \u0631\u0641\u0636 \u0627\u0644\u0637\u0644\u0628 \u2014 \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0633\u0628\u0628 \u0623\u0648 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u062C\u062F\u064A\u062F." }))] }));
}
export function UpgradeAccountPage() {
    const toast = useToast();
    const [params] = useSearchParams();
    const [tab, setTab] = useState('new');
    const [type, setType] = useState('doctor');
    const [search, setSearch] = useState('');
    const [entityId, setEntityId] = useState('');
    const [entityName, setEntityName] = useState('');
    const [requestedPlan, setRequestedPlan] = useState('pro');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [sending, setSending] = useState(false);
    const [done, setDone] = useState(false);
    const [trackPhone, setTrackPhone] = useState('');
    const [tracking, setTracking] = useState(false);
    const [tracked, setTracked] = useState(null);
    const [trackedError, setTrackedError] = useState('');
    const { data: settings, isLoading: settingsLoading } = useQuery({
        queryKey: ['site-settings'],
        queryFn: fetchSiteSettings,
    });
    const enabled = Boolean(settings?.subscriptions_enabled);
    const { data: results, isLoading: searching } = useQuery({
        queryKey: ['upgrade-search', type, search],
        queryFn: () => fetchEntities(type, { search, limit: 8 }),
        enabled: enabled && search.trim().length > 0,
        placeholderData: (prev) => prev,
    });
    // اختيار الباقة مسبقاً من رابط صفحة الباقات (?plan=gold)
    useEffect(() => {
        const p = params.get('plan');
        if (p === 'pro' || p === 'gold')
            setRequestedPlan(p);
    }, [params]);
    const submit = async (e) => {
        e.preventDefault();
        if (!entityId) {
            toast.show('اختر الجهة من القائمة', 'error');
            return;
        }
        if (!phone.trim()) {
            toast.show('أدخل رقم الهاتف للتواصل', 'error');
            return;
        }
        setSending(true);
        // حماية من التكرار: هل يوجد طلب قيد المعالجة بنفس الرقم؟
        const existing = await checkRequestStatus(phone);
        if (existing?.found && existing.status && PENDING_REQUEST_STATUSES.includes(existing.status)) {
            setSending(false);
            setTrackPhone(phone);
            setTracked(existing);
            setTab('track');
            toast.show('لديك طلب قيد المراجعة بهذا الرقم بالفعل', 'error');
            return;
        }
        const ok = await createSubscriptionRequest({
            entity_id: entityId,
            entity_type: type,
            current_plan: 'free',
            requested_plan: requestedPlan,
            phone: phone.trim(),
            notes: notes.trim() || undefined,
        });
        setSending(false);
        if (ok) {
            setDone(true);
            toast.show('تم إرسال طلب الترقية، سنتواصل معك قريباً');
        }
        else {
            toast.show('تعذر إرسال الطلب، حاول مجدداً', 'error');
        }
    };
    const track = async () => {
        if (!trackPhone.trim()) {
            toast.show('أدخل رقم الهاتف', 'error');
            return;
        }
        setTracking(true);
        setTrackedError('');
        const r = await checkRequestStatus(trackPhone);
        setTracking(false);
        if (!r) {
            setTrackedError('تعذر التحقق، حاول مجدداً');
            return;
        }
        if (!r.found) {
            setTrackedError('لا يوجد طلب ترقية مسجل بهذا الرقم.');
            setTracked(null);
            return;
        }
        setTracked(r);
    };
    const steps = useMemo(() => NEXT_STEPS, []);
    return (_jsxs("div", { className: "mx-auto max-w-3xl px-4 py-10 sm:px-6", children: [_jsx(Seo, { title: "\u062A\u0631\u0642\u064A\u0629 \u062D\u0633\u0627\u0628\u064A", description: "\u0623\u0631\u0633\u0644 \u0637\u0644\u0628 \u062A\u0631\u0642\u064A\u0629 \u0628\u0627\u0642\u062A\u0643 \u0641\u064A \u062F\u0644\u064A\u0644 \u0637\u064A\u0628\u0629 \u0627\u0644\u0625\u0645\u0627\u0645 \u0627\u0644\u0637\u0628\u064A \u0648\u062A\u0627\u0628\u0639 \u062D\u0627\u0644\u0629 \u0637\u0644\u0628\u0643 \u2014 \u062A\u0641\u0639\u064A\u0644 \u0644\u0645\u062F\u0629 \u0634\u0647\u0631 \u0628\u0639\u062F \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629.", path: "/upgrade", type: "website" }), _jsxs("div", { className: "text-center", children: [_jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-1.5 text-xs font-bold text-primary-dark", children: [_jsx(ArrowUpRight, { className: "size-3.5" }), "\u062A\u0631\u0642\u064A\u0629 \u062D\u0633\u0627\u0628\u064A"] }), _jsx("h1", { className: "mt-3 text-3xl font-black text-ink", children: "\u062A\u0631\u0642\u064A\u0629 \u062D\u0633\u0627\u0628\u064A \u0641\u064A \u0627\u0644\u062F\u0644\u064A\u0644" }), _jsx("p", { className: "mx-auto mt-2 max-w-xl text-sm leading-7 text-muted", children: "\u0623\u0631\u0633\u0644 \u0637\u0644\u0628 \u062A\u0631\u0642\u064A\u0629 \u0628\u0627\u0642\u062A\u0643\u060C \u0648\u0633\u0646\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u2014 \u064A\u064F\u0641\u0639\u0651\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0644\u0645\u062F\u0629 \u0634\u0647\u0631 \u0643\u0627\u0645\u0644 \u0645\u0646 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629." })] }), _jsx("div", { className: "mt-8 grid gap-3 sm:grid-cols-3", children: steps.map((s, i) => (_jsx(Card, { children: _jsxs(CardBody, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "flex size-9 items-center justify-center rounded-xl bg-primary-light text-primary-dark", children: _jsx(s.icon, { className: "size-4.5" }) }), _jsxs("span", { className: "text-[10px] font-black text-muted", children: ["\u0627\u0644\u062E\u0637\u0648\u0629 ", i + 1] })] }), _jsx("p", { className: "mt-2.5 text-sm font-black text-ink", children: s.title }), _jsx("p", { className: "mt-1 text-xs leading-6 text-muted", children: s.text })] }) }, s.title))) }), settingsLoading ? (_jsx("div", { className: "mt-8", children: _jsx(Skeletons, { rows: 4, box: "!p-6" }) })) : !enabled ? (_jsx(Card, { className: "mt-8", children: _jsxs(CardBody, { className: "py-14 text-center", children: [_jsx(Lock, { className: "mx-auto size-10 text-muted" }), _jsx("h2", { className: "mt-4 text-xl font-black text-ink", children: "\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A \u063A\u064A\u0631 \u0645\u0641\u0639\u0651\u0644\u0629 \u062D\u0627\u0644\u064A\u0627\u064B" }), _jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-muted", children: "\u062D\u0627\u0644\u064A\u0627\u064B \u062C\u0645\u064A\u0639 \u0627\u0644\u062C\u0647\u0627\u062A \u0645\u062F\u0631\u062C\u0629 \u0639\u0644\u0649 \u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629. \u0639\u0646\u062F\u0645\u0627 \u062A\u064F\u0641\u0639\u064E\u0651\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A \u0633\u064A\u0638\u0647\u0631 \u0646\u0645\u0648\u0630\u062C \u0637\u0644\u0628 \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0647\u0646\u0627." }), _jsx(Link, { to: "/", className: "mt-6 inline-block text-sm font-bold text-primary hover:underline", children: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0631\u0626\u064A\u0633\u064A\u0629" })] }) })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mt-8 grid grid-cols-2 gap-2 rounded-2xl bg-subtle p-1.5", children: [_jsxs("button", { type: "button", onClick: () => setTab('new'), className: cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition', tab === 'new' ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-ink'), children: [_jsx(Sparkles, { className: "size-4" }), " \u0637\u0644\u0628 \u062A\u0631\u0642\u064A\u0629 \u062C\u062F\u064A\u062F"] }), _jsxs("button", { type: "button", onClick: () => setTab('track'), className: cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition', tab === 'track' ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-ink'), children: [_jsx(Inbox, { className: "size-4" }), " \u0645\u062A\u0627\u0628\u0639\u0629 \u0637\u0644\u0628\u064A"] })] }), tab === 'new' && (_jsx(Card, { className: "mt-5", children: _jsx(CardBody, { children: done ? (_jsxs("div", { className: "py-8 text-center", children: [_jsx("span", { className: "mx-auto flex size-14 items-center justify-center rounded-full bg-primary-light text-primary-dark", children: _jsx(BadgeCheck, { className: "size-7" }) }), _jsx("h2", { className: "mt-4 text-xl font-black text-ink", children: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628\u0643 \u0628\u0646\u062C\u0627\u062D" }), _jsxs("p", { className: "mx-auto mt-2 max-w-md text-sm leading-7 text-muted", children: ["\u0637\u0644\u0628 \u062A\u0631\u0642\u064A\u0629 \u0628\u0627\u0642\u0629 ", requestedPlan === 'gold' ? 'ذهبية' : 'احترافية', " \u0642\u064A\u062F \u0627\u0644\u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u0622\u0646. \u0633\u0646\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0639\u0644\u0649", _jsxs("span", { className: "font-bold text-ink", dir: "ltr", children: [" ", phone] }), " \u0644\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643."] }), _jsx("div", { className: "mx-auto mt-5 max-w-sm space-y-2 text-right", children: steps.map((s, i) => (_jsxs("div", { className: "flex items-start gap-2.5 rounded-xl bg-subtle px-4 py-2.5", children: [_jsx(s.icon, { className: "mt-0.5 size-4 shrink-0 text-primary" }), _jsxs("p", { className: "text-xs leading-6 text-muted", children: [_jsxs("strong", { className: "text-ink", children: [i + 1, ". ", s.title, ":"] }), " ", s.text] })] }, s.title))) }), _jsxs("div", { className: "mt-5 flex flex-wrap justify-center gap-2", children: [_jsxs(Button, { variant: "outline", onClick: () => { setTab('track'); setTrackPhone(phone); setTracked(null); }, children: [_jsx(RefreshCw, { className: "size-4" }), " \u0645\u062A\u0627\u0628\u0639\u0629 \u062D\u0627\u0644\u0629 \u0637\u0644\u0628\u064A"] }), _jsx(Button, { variant: "ghost", onClick: () => { setDone(false); setEntityId(''); setEntityName(''); setSearch(''); setNotes(''); }, children: "\u0637\u0644\u0628 \u0622\u062E\u0631" })] })] })) : (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-lg font-black text-ink", children: "\u0628\u064A\u0627\u0646\u0627\u062A \u0637\u0644\u0628 \u0627\u0644\u062A\u0631\u0642\u064A\u0629" }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u0627\u062E\u062A\u0631 \u062C\u0647\u062A\u0643 \u0648\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629\u060C \u0648\u0633\u0646\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0639\u0644\u0649 \u0631\u0642\u0645\u0643." }), _jsxs("form", { onSubmit: submit, className: "mt-5 space-y-4", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "\u0646\u0648\u0639 \u0627\u0644\u062C\u0647\u0629", children: _jsx(Select, { value: type, onChange: (e) => { setType(e.target.value); setEntityId(''); setEntityName(''); setSearch(''); }, children: TYPE_OPTIONS.map((o) => _jsx("option", { value: o.value, children: o.label }, o.value)) }) }), _jsx(Field, { label: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629", children: _jsxs(Select, { value: requestedPlan, onChange: (e) => setRequestedPlan(e.target.value), children: [_jsx("option", { value: "pro", children: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629" }), _jsx("option", { value: "gold", children: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0630\u0647\u0628\u064A\u0629" })] }) })] }), _jsx(Field, { label: "\u062C\u0647\u062A\u0643 (\u0627\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645)", required: true, children: _jsx(Input, { value: search, onChange: (e) => { setSearch(e.target.value); setEntityId(''); setEntityName(''); }, placeholder: "\u0627\u0643\u062A\u0628 \u0627\u0633\u0645 \u0627\u0644\u0637\u0628\u064A\u0628 \u0623\u0648 \u0627\u0644\u062C\u0647\u0629\u2026" }) }), search.trim().length > 0 && !entityId && (_jsx("div", { className: "overflow-hidden rounded-xl border border-border", children: searching ? (_jsxs("div", { className: "p-3 text-center text-xs text-muted", children: [_jsx(Search, { className: "mx-auto size-4 animate-pulse" }), " \u062C\u0627\u0631\u064D \u0627\u0644\u0628\u062D\u062B\u2026"] })) : !results?.data.length ? (_jsx("div", { className: "p-3 text-center text-xs text-muted", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0646\u062A\u0627\u0626\u062C \u0645\u0637\u0627\u0628\u0642\u0629 \u2014 \u062A\u0623\u0643\u062F \u0645\u0646 \u0648\u062C\u0648\u062F \u062C\u0647\u062A\u0643 \u0641\u064A \u0627\u0644\u062F\u0644\u064A\u0644 \u0623\u0648\u0644\u0627\u064B." })) : (_jsx("ul", { className: "max-h-48 divide-y divide-border overflow-y-auto", children: results.data.map((r) => (_jsx("li", { children: _jsx("button", { type: "button", onClick: () => { setEntityId(r.id); setEntityName(r.name); }, className: "w-full cursor-pointer px-4 py-2.5 text-right text-sm font-semibold text-ink transition hover:bg-primary-light/40", children: r.name }) }, r.id))) })) })), entityId && (_jsxs("p", { className: "flex items-center gap-2 rounded-xl bg-primary-light/40 px-4 py-2.5 text-sm font-bold text-primary-dark", children: [_jsx(BadgeCheck, { className: "size-4" }), " \u062A\u0645 \u0627\u062E\u062A\u064A\u0627\u0631: ", entityName] })), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0644\u0644\u062A\u0648\u0627\u0635\u0644", required: true, children: _jsx(Input, { type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "09xx xxx xxx", dir: "ltr" }) }), _jsx(Field, { label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)", children: _jsx(Textarea, { rows: 2, value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "\u0623\u064A \u062A\u0641\u0627\u0635\u064A\u0644 \u0625\u0636\u0627\u0641\u064A\u0629\u2026" }) })] }), _jsxs(Button, { type: "submit", loading: sending, className: "w-full sm:w-auto", children: [_jsx(Send, { className: "size-4" }), "\u0625\u0631\u0633\u0627\u0644 \u0637\u0644\u0628 \u0627\u0644\u062A\u0631\u0642\u064A\u0629"] })] })] })) }) })), tab === 'track' && (_jsx(Card, { className: "mt-5", children: _jsxs(CardBody, { children: [_jsx("h2", { className: "text-lg font-black text-ink", children: "\u0645\u062A\u0627\u0628\u0639\u0629 \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628" }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u0623\u062F\u062E\u0644 \u0646\u0641\u0633 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0627\u0644\u0630\u064A \u0623\u0631\u0633\u0644\u062A \u0628\u0647 \u0627\u0644\u0637\u0644\u0628 \u0644\u0639\u0631\u0636 \u062D\u0627\u0644\u062A\u0647 \u0627\u0644\u0623\u062E\u064A\u0631\u0629." }), _jsxs("form", { onSubmit: (e) => { e.preventDefault(); void track(); }, className: "mt-4 flex flex-col gap-3 sm:flex-row", children: [_jsx(Input, { type: "tel", value: trackPhone, onChange: (e) => setTrackPhone(e.target.value), placeholder: "09xx xxx xxx", dir: "ltr", className: "flex-1" }), _jsxs(Button, { type: "submit", loading: tracking, variant: "outline", children: [_jsx(Inbox, { className: "size-4" }), " \u0639\u0631\u0636 \u0627\u0644\u062D\u0627\u0644\u0629"] })] }), trackedError && (_jsx("p", { className: "mt-4 rounded-xl bg-wine-soft px-4 py-3 text-xs font-bold text-error", children: trackedError })), tracked?.found && (_jsx("div", { className: "mt-4 rounded-2xl border border-border bg-subtle p-4", children: _jsx(StatusCard, { r: tracked }) })), _jsxs("p", { className: "mt-5 flex items-start gap-2 text-xs leading-6 text-muted", children: [_jsx(CreditCard, { className: "mt-0.5 size-4 shrink-0 text-primary" }), "\u062A\u064F\u0641\u0639\u0651\u0644 \u0627\u0644\u0628\u0627\u0642\u0629 \u0644\u0645\u062F\u0629 \u0634\u0647\u0631 \u0645\u0646 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629\u060C \u0648\u0639\u0646\u062F \u0627\u0646\u062A\u0647\u0627\u0626\u0647\u0627 \u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0639\u0644\u0649 \u062A\u062C\u062F\u064A\u062F \u062C\u062F\u064A\u062F \u0645\u0646 \u0647\u0646\u0627 \u0623\u0648 \u0645\u0646 \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u062C\u0647\u062A\u0643."] })] }) })), _jsx(Card, { className: "mt-6 border-primary/20 bg-primary-light/30", children: _jsxs(CardBody, { className: "flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "flex size-10 shrink-0 items-center justify-center rounded-2xl bg-surface text-primary shadow-sm", children: _jsx(Crown, { className: "size-5" }) }), _jsx("p", { className: "text-sm font-bold text-ink", children: "\u0644\u062F\u064A\u0643 \u062D\u0633\u0627\u0628 \u062C\u0647\u0629 \u0648\u062A\u062F\u064A\u0631 \u0645\u0644\u0641\u0643 \u0645\u0646 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645\u061F" })] }), _jsxs(Link, { to: "/dashboard", className: "inline-flex shrink-0 items-center gap-1.5 text-sm font-black text-primary hover:underline", children: ["\u0627\u0644\u062A\u062C\u062F\u064A\u062F \u0645\u0646 \u0644\u0648\u062D\u062A\u0643 ", _jsx(ArrowUpRight, { className: "size-4" })] })] }) })] }))] }));
}
