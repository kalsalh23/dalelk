import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X, Phone, CreditCard, Crown, Sparkles, Lock, Copy, MessageCircle, KeyRound, AlertTriangle, RefreshCcw } from 'lucide-react';
import { fetchAdminStats, fetchSubscriptionRequests, fetchSettings, saveSettings, updateRequestStatus, ensureEntityAccount } from '@/services/admin';
import { fetchStatsSummary } from '@/services/stats';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeletons, EmptyState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { formatDate, formatNumber } from '@/lib/utils';
import { PLANS, SUBSCRIPTIONS_ENABLED } from '@/constants';
import { cn } from '@/lib/utils';
const planIcons = { free: Lock, pro: Sparkles, gold: Crown };
export function AdminPlansPage() {
    const qc = useQueryClient();
    const toast = useToast();
    const [settings, setSettings] = useState(null);
    const { data: stats, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchAdminStats });
    const { data: reqs } = useQuery({ queryKey: ['admin-requests'], queryFn: fetchSubscriptionRequests });
    useQuery({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            const s = await fetchSettings();
            setSettings({ subscriptions_enabled: Boolean(s.subscriptions_enabled) });
            return s;
        },
    });
    const toggle = async () => {
        if (!settings)
            return;
        const next = { subscriptions_enabled: !settings.subscriptions_enabled };
        const ok = await saveSettings(next);
        if (ok) {
            setSettings(next);
            await qc.invalidateQueries({ queryKey: ['admin-settings'] });
            toast.show(next.subscriptions_enabled ? 'تم تفعيل الاشتراكات' : 'تم تعطيل الاشتراكات');
        }
        else {
            toast.show('تعذر التحديث', 'error');
        }
    };
    const enabled = settings?.subscriptions_enabled ?? SUBSCRIPTIONS_ENABLED;
    const counts = { free: stats?.plans.free ?? 0, pro: stats?.plans.pro ?? 0, gold: stats?.plans.gold ?? 0 };
    const active = reqs?.filter((r) => r.status === 'approved').length ?? 0;
    const expired = reqs?.filter((r) => r.status === 'rejected').length ?? 0;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A" }), _jsx("p", { className: "mt-0.5 text-sm text-muted", children: enabled ? 'الاشتراكات مفعّلة — تظهر باقات الترقية للزوار' : 'الاشتراكات معطّلة حالياً — الجميع على الباقة المجانية' })] }), _jsx(Button, { size: "sm", variant: enabled ? 'outline' : 'primary', onClick: () => void toggle(), children: enabled ? 'تعطيل الاشتراكات' : 'تفعيل الاشتراكات' })] }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [['free', 'pro', 'gold'].map((plan) => {
                        const def = PLANS.find((p) => p.key === plan);
                        const Icon = planIcons[plan];
                        return (_jsx(Card, { children: _jsxs(CardBody, { children: [_jsx(Icon, { className: cn('size-6', plan === 'gold' ? 'text-gold-dark' : plan === 'pro' ? 'text-primary' : 'text-muted') }), _jsx("p", { className: "mt-2 font-black text-ink", children: def.name }), _jsxs("p", { className: "mt-1 text-sm font-black text-ink", children: [formatNumber(counts[plan]), " \u062C\u0647\u0629"] }), _jsx("ul", { className: "mt-3 space-y-1 text-[11px] text-muted", children: def.features.slice(0, 3).map((f) => _jsxs("li", { className: "flex items-center gap-1", children: [_jsx(Check, { className: "size-3 text-success" }), f] }, f)) })] }) }, plan));
                    }), _jsx(Card, { className: "bg-gradient-to-l from-primary to-primary-dark text-white", children: _jsxs(CardBody, { children: [_jsx(CreditCard, { className: "size-6" }), _jsx("p", { className: "mt-2 font-black", children: "\u0645\u0644\u062E\u0635 \u0639\u0627\u0645" }), _jsxs("p", { className: "mt-2 text-sm", children: [formatNumber(active), " \u0627\u0634\u062A\u0631\u0627\u0643 \u0646\u0634\u0637"] }), _jsxs("p", { className: "text-sm", children: [formatNumber(expired), " \u0645\u0646\u062A\u0647\u064A"] }), _jsx("p", { className: "mt-2 text-xs text-white/80", children: "\u064A\u064F\u0634\u063A\u0651\u0644 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0645\u0627\u0644\u064A \u0645\u0633\u062A\u0642\u0628\u0644\u0627\u064B \u0628\u0639\u062F \u0627\u0646\u062A\u0634\u0627\u0631 \u0627\u0644\u0645\u0646\u0635\u0629." })] }) })] }), isLoading && _jsx(Skeletons, { rows: 2, box: "!p-6" })] }));
}
const statusStyle = {
    new: 'bg-primary-light/60 text-primary-dark',
    contacting: 'bg-gold-soft text-gold-dark',
    awaiting_payment: 'bg-gold-soft text-gold-dark',
    approved: 'bg-emerald-50 text-success',
    rejected: 'bg-wine-soft text-error',
};
const statusLabel = {
    new: 'جديد',
    contacting: 'تم التواصل',
    awaiting_payment: 'بانتظار الدفع',
    approved: 'موافق عليه',
    rejected: 'مرفوض',
};
export function AdminRequestsPage() {
    const qc = useQueryClient();
    const toast = useToast();
    const [selected, setSelected] = useState(null);
    const [creds, setCreds] = useState(null);
    const [copied, setCopied] = useState(null);
    const { data: requests, isLoading } = useQuery({ queryKey: ['admin-requests'], queryFn: fetchSubscriptionRequests });
    const mut = useMutation({
        mutationFn: async ({ id, status, notes }) => {
            const res = await updateRequestStatus(id, status, notes);
            if (!res.ok)
                throw new Error();
            return { res, status };
        },
        onSuccess: ({ res, status }) => {
            void qc.invalidateQueries({ queryKey: ['admin-requests'] });
            toast.show('تم تحديث الحالة');
            setSelected(null);
            if (status === 'approved') {
                setCreds({ ...res, status, phone: selected?.phone, entityType: selected?.entityType, entityId: selected?.entityId });
            }
        },
        onError: () => toast.show('تعذر التحديث', 'error'),
    });
    const credMut = useMutation({
        mutationFn: async ({ entityType, entityId }) => {
            const res = await ensureEntityAccount(entityType, entityId);
            if (res.accountError)
                throw new Error(res.accountError);
            return res;
        },
        onSuccess: (res) => {
            toast.show('تم توليد بيانات دخول جديدة');
            setCreds({ ...res, status: 'approved' });
        },
        onError: (e) => toast.show(e.message || 'تعذر توليد البيانات', 'error'),
    });
    const accountLink = creds?.slug && creds.linkToken
        ? `${window.location.origin}/account/${creds.slug}?tk=${encodeURIComponent(creds.linkToken)}`
        : creds?.slug
            ? `${window.location.origin}/dashboard/login`
            : '';
    const waPhone = creds?.phone ? `963${creds.phone.replace(/\D/g, '').replace(/^0/, '')}` : '';
    const credMessage = `بيانات الدخول إلى لوحة تحكم جهتك في دليل طيبة الإمام الطبي:\n${accountLink ? `رابط الدخول: ${accountLink}\n` : ''}البريد: ${creds?.email ?? ''}\nكلمة السر: ${creds?.password ?? ''}`;
    const waLink = waPhone ? `https://wa.me/${waPhone}?text=${encodeURIComponent(credMessage)}` : '';
    const copy = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied(null), 1200);
        }
        catch {
            toast.show('تعذر النسخ', 'error');
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u0631\u0642\u064A\u0629" }), _jsxs("p", { className: "mt-0.5 text-sm text-muted", children: ["\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0623\u0637\u0628\u0627\u0621 \u0648\u0627\u0644\u0639\u064A\u0627\u062F\u0627\u062A \u0644\u062A\u0631\u0642\u064A\u0629 \u0635\u0641\u062D\u0647 ", requests?.length ? `(${requests.length})` : ''] })] }), isLoading ? (_jsx(Skeletons, { rows: 4, box: "!p-5" })) : !requests?.length ? (_jsx(EmptyState, { title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0637\u0644\u0628\u0627\u062A", description: "\u0639\u0646\u062F \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A \u0633\u062A\u0638\u0647\u0631 \u0647\u0646\u0627 \u0637\u0644\u0628\u0627\u062A \u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0635\u0641\u062D\u0627\u062A." })) : (_jsx("div", { className: "space-y-3", children: requests.map((r) => (_jsxs(Card, { className: "flex flex-col gap-4 p-5 sm:flex-row sm:items-center", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("p", { className: "font-black text-ink", children: r.entity_type }), _jsx("span", { className: "rounded-full bg-subtle-strong px-2 py-0.5 text-[10px] font-bold text-muted", dir: "ltr", children: r.entity_id.slice(0, 8) }), _jsx("span", { className: cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold', statusStyle[r.status]), children: statusLabel[r.status] })] }), _jsxs("p", { className: "mt-1.5 flex items-center gap-2 text-sm text-muted", children: [_jsx("span", { className: "font-semibold text-ink", children: r.current_plan === 'free' ? 'مجاني' : r.current_plan }), "\u2190", _jsx("span", { className: "font-bold text-primary", children: r.requested_plan === 'gold' ? 'ذهبي' : r.requested_plan === 'pro' ? 'احترافي' : 'مجاني' })] }), _jsxs("p", { className: "mt-1 flex items-center gap-1.5 text-xs text-muted", children: [_jsx(Phone, { className: "size-3.5 text-primary" }), _jsx("span", { dir: "ltr", children: r.phone ?? '—' }), _jsx("span", { className: "mx-1", children: "\u00B7" }), formatDate(r.created_at)] }), r.notes && _jsxs("p", { className: "mt-1 text-xs text-muted", children: ["\u0645\u0644\u0627\u062D\u0638\u0627\u062A: ", r.notes] })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "secondary", onClick: () => setSelected({ id: r.id, status: 'contacting', phone: r.phone ?? undefined, entityType: r.entity_type, entityId: r.entity_id }), children: "\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644" }), _jsx(Button, { size: "sm", onClick: () => setSelected({ id: r.id, status: 'approved', phone: r.phone ?? undefined, entityType: r.entity_type, entityId: r.entity_id }), children: "\u0645\u0648\u0627\u0641\u0642\u0629" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => setSelected({ id: r.id, status: 'rejected', phone: r.phone ?? undefined, entityType: r.entity_type, entityId: r.entity_id }), children: "\u0631\u0641\u0636" }), r.status === 'approved' && (_jsxs(Button, { size: "sm", variant: "ghost", loading: credMut.isPending && credMut.variables?.entityId === r.entity_id, onClick: () => credMut.mutate({ entityType: r.entity_type, entityId: r.entity_id }), children: [_jsx(KeyRound, { className: "size-4" }), " \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644"] }))] })] }, r.id))) })), _jsx(Dialog, { open: selected !== null, onClose: () => setSelected(null), title: "\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628", size: "sm", children: _jsxs("div", { className: "space-y-5", children: [_jsx("p", { className: "text-sm text-muted", children: "\u0627\u062E\u062A\u0631 \u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0648\u0623\u0636\u0641 \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0646 \u0644\u0632\u0645:" }), _jsx(StatusPicker, { onPick: (status, notes) => selected && mut.mutate({ id: selected.id, status, notes }), loading: mut.isPending })] }) }), _jsx(Dialog, { open: creds !== null, onClose: () => setCreds(null), title: "\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u2014 \u0628\u064A\u0627\u0646\u0627\u062A \u062F\u062E\u0648\u0644 \u0627\u0644\u062C\u0647\u0629", size: "md", children: _jsx("div", { className: "space-y-5", children: creds?.accountError ? (_jsxs(_Fragment, { children: [_jsxs("p", { className: "flex items-start gap-2 rounded-xl bg-wine-soft px-4 py-3 text-sm font-bold text-error", children: [_jsx(AlertTriangle, { className: "mt-0.5 size-4 shrink-0" }), "\u062A\u0639\u0630\u0631 \u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628 \u0627\u0644\u062C\u0647\u0629: ", creds.accountError] }), creds.entityType && creds.entityId && (_jsxs(Button, { className: "w-full", loading: credMut.isPending, onClick: () => credMut.mutate({ entityType: creds.entityType, entityId: creds.entityId }), children: [_jsx(RefreshCcw, { className: "size-4" }), " \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629"] }))] })) : (_jsxs(_Fragment, { children: [_jsxs("p", { className: "rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-success", children: ["\u2713 \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0644\u0645\u062F\u0629 \u0634\u0647\u0631 \u0648\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628 \u062E\u0627\u0635 \u0628\u0640", creds?.name ? ` "${creds.name}"` : ' الجهة', "."] }), _jsx("p", { className: "text-xs leading-6 text-muted", children: "\u0623\u0631\u0633\u0644 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0644\u0644\u0637\u0628\u064A\u0628/\u0627\u0644\u062C\u0647\u0629 \u0639\u0628\u0631 \u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0623\u0648 \u0648\u0627\u062A\u0633\u0627\u0628 \u0627\u0644\u0645\u0630\u0643\u0648\u0631 \u0641\u064A \u0627\u0644\u0637\u0644\u0628 \u2014 \u0627\u0644\u0631\u0627\u0628\u0637 \u064A\u0641\u062A\u062D \u0644\u0648\u062D\u062A\u0647 \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u062F\u0648\u0646 \u0643\u0644\u0645\u0629 \u0633\u0631." }), _jsxs("div", { className: "space-y-3", children: [_jsx(CredRow, { label: "\u0631\u0627\u0628\u0637 \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0644\u0644\u0648\u062D\u0629 \u0627\u0644\u062C\u0647\u0629", value: accountLink, copied: copied === 'link', onCopy: () => void copy(accountLink, 'link') }), _jsx(CredRow, { label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", value: creds?.email ?? '', copied: copied === 'email', onCopy: () => void copy(creds?.email ?? '', 'email') }), _jsx(CredRow, { label: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631", value: creds?.password ?? '', copied: copied === 'pass', onCopy: () => void copy(creds?.password ?? '', 'pass') })] }), _jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [waLink && (_jsx(Button, { variant: "whatsapp", asChild: true, children: _jsxs("a", { href: waLink, target: "_blank", rel: "noopener noreferrer", children: [_jsx(MessageCircle, { className: "size-4" }), " \u0625\u0631\u0633\u0627\u0644 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628"] }) })), _jsxs(Button, { variant: "secondary", onClick: () => void copy(credMessage, 'all'), children: [copied === 'all' ? _jsx(Check, { className: "size-4" }) : _jsx(Copy, { className: "size-4" }), copied === 'all' ? 'تم النسخ' : 'نسخ البيانات معاً'] })] }), _jsxs("p", { className: "flex items-start gap-1.5 text-[11px] leading-5 text-muted", children: [_jsx(KeyRound, { className: "mt-0.5 size-3.5 shrink-0 text-primary" }), "\u0636\u0627\u0639\u062A \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0623\u0648 \u0627\u0646\u062A\u0647\u062A \u062D\u0627\u062C\u062A\u0647\u0627\u061F \u0632\u0631 \u00AB\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u062E\u0648\u0644\u00BB \u0641\u064A \u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0637\u0644\u0628 \u064A\u0648\u0644\u0651\u062F \u0643\u0644\u0645\u0629 \u0633\u0631 \u0648\u0631\u0627\u0628\u0637\u0627\u064B \u062C\u062F\u064A\u062F\u064A\u0646 \u0641\u064A \u0623\u064A \u0648\u0642\u062A."] })] })) }) })] }));
}
function CredRow({ label, value, onCopy, copied }) {
    return (_jsxs("div", { className: "flex items-center justify-between gap-3 rounded-xl border border-border bg-subtle px-4 py-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "text-[11px] font-bold text-muted", children: label }), _jsx("p", { className: "mt-0.5 truncate text-sm font-bold text-ink", dir: "ltr", children: value })] }), _jsx("button", { onClick: onCopy, className: "flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:text-primary cursor-pointer", "aria-label": `نسخ ${label}`, children: copied ? _jsx(Check, { className: "size-4 text-success" }) : _jsx(Copy, { className: "size-4" }) })] }));
}
function StatusPicker({ onPick, loading }) {
    const [notes, setNotes] = useState('');
    return (_jsxs("div", { className: "space-y-3", children: [_jsx(Input, { placeholder: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)", value: notes, onChange: (e) => setNotes(e.target.value) }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: ['approved', 'rejected', 'awaiting_payment', 'contacting'].map((s) => (_jsxs(Button, { variant: s === 'approved' ? 'primary' : s === 'rejected' ? 'danger' : 'outline', size: "sm", loading: loading, onClick: () => onPick(s, notes), children: [s === 'approved' ? _jsx(Check, { className: "size-4" }) : s === 'rejected' ? _jsx(X, { className: "size-4" }) : null, statusLabel[s]] }, s))) })] }));
}
export function AdminStatsPage() {
    const { data: traffic, isLoading } = useQuery({ queryKey: ['admin-traffic'], queryFn: fetchStatsSummary });
    if (isLoading)
        return _jsx(Skeletons, { rows: 5, box: "!p-5" });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A" }), _jsx("p", { className: "mt-0.5 text-sm text-muted", children: "\u0633\u062C\u0644 \u0645\u062C\u0627\u0646\u064A \u0644\u0644\u0623\u062D\u062F\u0627\u062B \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0629 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646" })] }), _jsx("div", { className: "grid grid-cols-2 gap-4 sm:grid-cols-3", children: [
                    ['زيارات الصفحات', traffic?.pageViews ?? 0],
                    ['عمليات البحث', traffic?.searches ?? 0],
                    ['مشاهدات الملفات', traffic?.profileViews ?? 0],
                    ['ضغطات الاتصال', traffic?.phoneClicks ?? 0],
                    ['ضغطات واتساب', traffic?.whatsappClicks ?? 0],
                    ['ضغطات الخريطة', traffic?.mapClicks ?? 0],
                ].map(([label, value]) => (_jsx(Card, { children: _jsxs(CardBody, { className: "text-center", children: [_jsx("p", { className: "text-3xl font-black text-primary", children: formatNumber(Number(value)) }), _jsx("p", { className: "mt-1 text-xs font-bold text-muted", children: label })] }) }, String(label)))) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u0623\u0643\u062B\u0631 \u0627\u0644\u0635\u0641\u062D\u0627\u062A \u0645\u0634\u0627\u0647\u062F\u0629" }) }), _jsx(CardBody, { children: !traffic?.topPages.length ? _jsx("p", { className: "py-6 text-center text-sm text-muted", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0639\u062F" }) : (_jsx("ul", { className: "divide-y divide-border", children: traffic.topPages.map((p, i) => (_jsxs("li", { className: "flex items-center gap-3 py-3", children: [_jsx("span", { className: "flex size-7 items-center justify-center rounded-lg bg-primary-light text-xs font-black text-primary-dark", children: i + 1 }), _jsx("span", { className: "flex-1 truncate text-sm font-semibold text-ink", dir: "ltr", children: p.path === '/' ? '/' : p.path }), _jsx("span", { className: "text-sm font-black text-ink", children: formatNumber(p.count) })] }, p.path))) })) })] })] }));
}
export function AdminSettingsPage() {
    const qc = useQueryClient();
    const toast = useToast();
    const [settings, setSettings] = useState(null);
    const [saving, setSaving] = useState(false);
    const { isLoading } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            const s = await fetchSettings();
            setSettings({ subscriptions_enabled: Boolean(s.subscriptions_enabled), notification_email: String(s.notification_email ?? '') });
            return s;
        },
    });
    const save = async () => {
        if (!settings)
            return;
        setSaving(true);
        const ok = await saveSettings(settings);
        setSaving(false);
        if (ok) {
            await qc.invalidateQueries({ queryKey: ['admin-settings'] });
            toast.show('تم حفظ الإعدادات');
        }
        else
            toast.show('تعذر الحفظ', 'error');
    };
    if (isLoading || !settings)
        return _jsx(Skeletons, { rows: 4, box: "!p-5" });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" }), _jsx("p", { className: "mt-0.5 text-sm text-muted", children: "\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0639\u0627\u0645\u0629 \u0644\u0644\u0645\u0646\u0635\u0629" })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(CreditCard, { className: "size-5 text-primary" }), "\u0646\u0638\u0627\u0645 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A"] }) }), _jsxs(CardBody, { className: "space-y-4", children: [_jsx(Field, { label: "\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0627\u062A", hint: "\u0641\u064A \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0623\u0648\u0644\u0649 \u064A\u0643\u0648\u0646 \u0645\u0639\u0637\u0644\u0627\u064B (false). \u0639\u0646\u062F \u0627\u0644\u062A\u0641\u0639\u064A\u0644 \u0633\u062A\u0638\u0647\u0631 \u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0631\u0642\u064A\u0629 \u0644\u0644\u0632\u0648\u0627\u0631.", children: _jsxs("label", { className: "flex cursor-pointer items-center justify-between rounded-xl border border-border p-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-bold text-ink", children: settings.subscriptions_enabled ? 'مفعّلة' : 'معطّلة' }), _jsx("p", { className: "text-xs text-muted", children: "\u0639\u0646\u062F \u0627\u0644\u062A\u0641\u0639\u064A\u0644 \u064A\u0639\u0631\u0636 \u0627\u0644\u0642\u0637\u0627\u0639 \u0627\u0644\u062D\u0631\u0641\u064A Free Pro Gold" })] }), _jsx("div", { onClick: () => setSettings((s) => ({ ...(s ?? {}), subscriptions_enabled: !settings.subscriptions_enabled })), className: cn('relative h-7 w-12 rounded-full transition-colors', settings.subscriptions_enabled ? 'bg-primary' : 'bg-faint'), children: _jsx("span", { className: cn('absolute top-1 size-5 rounded-full bg-white shadow transition-all', settings.subscriptions_enabled ? 'right-6' : 'right-1') }) })] }) }), _jsx(Field, { label: "\u0628\u0631\u064A\u062F \u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0627\u0644\u0637\u0644\u0628\u0627\u062A", children: _jsx(Input, { type: "email", value: String(settings.notification_email ?? ''), onChange: (e) => setSettings((s) => ({ ...(s ?? {}), notification_email: e.target.value })) }) }), _jsx(Button, { onClick: () => void save(), loading: saving, children: "\u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "\u0627\u0644\u0623\u0645\u0627\u0646" }) }), _jsxs(CardBody, { className: "space-y-3 text-sm text-muted", children: [_jsx("p", { children: "\u2022 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 \u062A\u064F\u062F\u0627\u0631 \u0639\u0628\u0631 Supabase Auth." }), _jsx("p", { children: "\u2022 \u0637\u0628\u0642\u0627\u062A \u0627\u0644\u062D\u0645\u0627\u064A\u0629 RLS \u062A\u0641\u0635\u0644 \u0628\u064A\u0646 \u0627\u0644\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0648\u0627\u0644\u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629." }), _jsx("p", { children: "\u2022 \u0644\u0627 \u062A\u064F\u062E\u0632\u064E\u0651\u0646 \u0623\u064A \u0628\u064A\u0627\u0646\u0627\u062A \u0633\u0631\u064A\u0629 \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u062A\u0635\u0641\u062D\u061B \u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D \u0627\u0644\u062D\u0633\u0627\u0633\u0629 \u062A\u0628\u0642\u0649 \u0641\u064A \u0628\u064A\u0626\u0629 \u0627\u0644\u062E\u0627\u062F\u0645." })] })] })] }));
}
