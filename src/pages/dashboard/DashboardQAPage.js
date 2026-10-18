import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { HelpCircle, Plus, Trash2, MessageSquareText, Crown, Lock, Search } from 'lucide-react';
import { useDashboardSession } from '@/layouts/DashboardLayout';
import { readStoredSession, doctorQaList, doctorQaAdd, doctorQaDelete } from '@/services/entityAccount';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Skeletons, EmptyState } from '@/components/ui/States';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';
const PLAN_LABELS = { free: 'المجانية', pro: 'الاحترافية', gold: 'الذهبية' };
/** واجهة «اكتب سؤالك»: الطبيب يضيف سؤالاً مع إجابته ليظهر لمواطني «اسأل دليلك» */
export function DashboardQAPage() {
    const { session } = useDashboardSession();
    const toast = useToast();
    const isDoctor = session?.entity_type === 'doctor';
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [keywords, setKeywords] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const load = useCallback(async () => {
        const token = readStoredSession()?.token;
        if (!token)
            return;
        setLoading(true);
        const res = await doctorQaList(token);
        setData(res);
        setLoading(false);
    }, []);
    useEffect(() => {
        if (isDoctor)
            void load();
        else
            setLoading(false);
    }, [isDoctor, load]);
    const submit = async (e) => {
        e.preventDefault();
        const token = readStoredSession()?.token;
        if (!token)
            return;
        if (question.trim().length < 5 || answer.trim().length < 5) {
            toast.show('اكتب السؤال والإجابة بشكل كامل', 'error');
            return;
        }
        setSaving(true);
        const res = await doctorQaAdd(token, question.trim(), answer.trim(), keywords.trim());
        setSaving(false);
        if (!res || res.error) {
            toast.show(res?.error ?? 'تعذر إضافة السؤال', 'error');
            return;
        }
        toast.show('تمت إضافة السؤال — سيظهر لمواطني «اسأل دليلك»');
        setQuestion('');
        setAnswer('');
        setKeywords('');
        void load();
    };
    const remove = async () => {
        const token = readStoredSession()?.token;
        if (!token || !deleting)
            return;
        const res = await doctorQaDelete(token, deleting.id);
        if (!res || res.error) {
            toast.show(res?.error ?? 'تعذر حذف السؤال', 'error');
            return;
        }
        toast.show('تم حذف السؤال');
        setDeleting(null);
        void load();
    };
    // غير مخصص للأطباء
    if (session && !isDoctor) {
        return (_jsx(Card, { children: _jsxs(CardBody, { className: "p-10 text-center", children: [_jsx("div", { className: "mx-auto flex size-14 items-center justify-center rounded-2xl bg-subtle text-muted", children: _jsx(Lock, { className: "size-6" }) }), _jsx("h1", { className: "mt-4 text-lg font-black text-ink", children: "\u0647\u0630\u0647 \u0627\u0644\u0648\u0627\u062C\u0647\u0629 \u0645\u062E\u0635\u0635\u0629 \u0644\u0644\u0623\u0637\u0628\u0627\u0621" }), _jsx("p", { className: "mt-2 text-sm text-muted", children: "\u0645\u064A\u0632\u0629 \u00AB\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643\u00BB \u0645\u062A\u0627\u062D\u0629 \u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0623\u0637\u0628\u0627\u0621 \u0641\u0642\u0637." })] }) }));
    }
    // غير مسجل الدخول
    if (!session) {
        return (_jsx(Card, { children: _jsxs(CardBody, { className: "p-10 text-center", children: [_jsx("h1", { className: "text-lg font-black text-ink", children: "\u0633\u062C\u0651\u0644 \u062F\u062E\u0648\u0644\u0643 \u0623\u0648\u0644\u0627\u064B" }), _jsx(Link, { to: "/dashboard/login", className: "mt-4 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark", children: "\u0635\u0641\u062D\u0629 \u0627\u0644\u062F\u062E\u0648\u0644" })] }) }));
    }
    const plan = data?.plan ?? 'free';
    const limit = data?.limit ?? 0;
    const count = data?.count ?? 0;
    const canAdd = plan !== 'free' && count < limit;
    const pct = limit ? Math.min(100, Math.round((count / limit) * 100)) : 0;
    const items = data?.items ?? [];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("h1", { className: "flex items-center gap-2 text-2xl font-black text-ink", children: [_jsx(HelpCircle, { className: "size-6 text-primary" }), "\u0627\u0643\u062A\u0628 \u0633\u0624\u0627\u0644\u0643"] }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "\u0623\u0636\u0641 \u0633\u0624\u0627\u0644\u0627\u064B \u0634\u0627\u0626\u0639\u0627\u064B \u0645\u0639 \u0625\u062C\u0627\u0628\u062A\u0647 \u2014 \u0633\u064A\u0631\u0627\u0647\u0627 \u0627\u0644\u0645\u0648\u0627\u0637\u0646 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0639\u0646\u062F \u0633\u0624\u0627\u0644\u0647 \u0641\u064A \u00AB\u0627\u0633\u0623\u0644 \u062F\u0644\u064A\u0644\u0643\u00BB." })] }), loading ? (_jsx(Skeletons, { rows: 3 })) : data?.error && data.error !== 'unauthorized' ? (_jsx(Card, { children: _jsx(CardBody, { className: "p-6 text-sm text-error", children: data.error }) })) : (_jsxs(_Fragment, { children: [_jsx(Card, { children: _jsx(CardBody, { className: "p-5", children: plan === 'free' ? (_jsxs("div", { className: "flex flex-col items-start gap-3 sm:flex-row sm:items-center", children: [_jsxs("div", { className: "flex items-center gap-2 rounded-xl bg-gold-soft px-3 py-2 text-xs font-bold text-gold-dark", children: [_jsx(Lock, { className: "size-4" }), "\u0628\u0627\u0642\u062A\u0643 \u0627\u0644\u062D\u0627\u0644\u064A\u0629: \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629"] }), _jsx("p", { className: "text-sm text-muted", children: "\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0645\u062A\u0627\u062D\u0629 \u0644\u0623\u0635\u062D\u0627\u0628 \u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 (25 \u0633\u0624\u0627\u0644\u0627\u064B) \u0623\u0648 \u0627\u0644\u0630\u0647\u0628\u064A\u0629 (100 \u0633\u0624\u0627\u0644)." }), _jsx(Link, { to: "/plans", className: "sm:ms-auto", children: _jsxs(Button, { size: "sm", children: [_jsx(Crown, { className: "size-4" }), "\u062A\u0631\u0642\u064A\u0629 \u0627\u0644\u0628\u0627\u0642\u0629"] }) })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 text-sm", children: [_jsxs("p", { className: "font-bold text-ink", children: ["\u0627\u0633\u062A\u0647\u0644\u0643\u062A ", _jsx("span", { className: cnCount(count, limit), children: count }), " \u0645\u0646 \u0623\u0635\u0644 ", limit, " \u0633\u0624\u0627\u0644", _jsxs("span", { className: "ms-2 rounded-full bg-gold-soft px-2.5 py-0.5 text-[11px] font-bold text-gold-dark", children: ["\u0628\u0627\u0642\u0629 ", PLAN_LABELS[plan]] })] }), count >= limit && _jsx("span", { className: "rounded-full bg-wine-soft px-2.5 py-1 text-[11px] font-bold text-error", children: "\u0648\u0635\u0644\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649" })] }), _jsx("div", { className: "h-2 overflow-hidden rounded-full bg-subtle", children: _jsx("div", { className: cnBar(pct), style: { width: `${pct}%` } }) })] })) }) }), canAdd ? (_jsx(Card, { children: _jsxs(CardBody, { className: "p-5 sm:p-6", children: [_jsxs("h2", { className: "mb-4 flex items-center gap-2 text-base font-black text-ink", children: [_jsx(Plus, { className: "size-4.5 text-primary" }), "\u0625\u0636\u0627\u0641\u0629 \u0633\u0624\u0627\u0644 \u062C\u062F\u064A\u062F"] }), _jsxs("form", { onSubmit: submit, className: "space-y-4", children: [_jsx(Field, { label: "\u0627\u0644\u0633\u0624\u0627\u0644", required: true, children: _jsx(Input, { value: question, onChange: (e) => setQuestion(e.target.value), placeholder: "\u0645\u062B\u0627\u0644: \u0645\u0627 \u0647\u0648 \u0627\u0644\u0639\u0644\u0627\u062C \u0627\u0644\u0645\u0646\u0632\u0644\u064A \u0644\u0646\u0632\u0644\u0629 \u0627\u0644\u0628\u0631\u062F\u061F" }) }), _jsx(Field, { label: "\u0627\u0644\u0625\u062C\u0627\u0628\u0629", required: true, children: _jsx(Textarea, { rows: 5, value: answer, onChange: (e) => setAnswer(e.target.value), placeholder: "\u0627\u0643\u062A\u0628 \u0625\u062C\u0627\u0628\u0629 \u0648\u0627\u0636\u062D\u0629 \u0648\u0645\u0628\u0633\u0637\u0629 \u0644\u0644\u0645\u0648\u0627\u0637\u0646\u2026" }) }), _jsx(Field, { label: "\u0643\u0644\u0645\u0627\u062A \u0645\u0641\u062A\u0627\u062D\u064A\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)", hint: "\u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0641\u0627\u0635\u0644\u0629 \u2014 \u062A\u0633\u0627\u0639\u062F \u0645\u0637\u0627\u0628\u0642\u0629 \u0633\u0624\u0627\u0644 \u0627\u0644\u0645\u0648\u0627\u0637\u0646 \u0645\u0639 \u0625\u062C\u0627\u0628\u062A\u0643\u060C \u0645\u062B\u0627\u0644: \u0628\u0631\u062F\u060C \u0632\u0643\u0627\u0645\u060C \u0633\u0639\u0627\u0644\u060C \u0631\u0634\u062D", children: _jsx(Input, { value: keywords, onChange: (e) => setKeywords(e.target.value), placeholder: "\u0628\u0631\u062F\u060C \u0632\u0643\u0627\u0645\u060C \u0633\u0639\u0627\u0644" }) }), _jsxs(Button, { type: "submit", loading: saving, children: [_jsx(Plus, { className: "size-4" }), "\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0633\u0624\u0627\u0644"] })] })] }) })) : null, _jsx(Card, { children: _jsxs(CardBody, { className: "p-5 sm:p-6", children: [_jsxs("h2", { className: "mb-4 flex items-center gap-2 text-base font-black text-ink", children: [_jsx(MessageSquareText, { className: "size-4.5 text-primary" }), "\u0623\u0633\u0626\u0644\u062A\u064A \u0627\u0644\u0645\u0636\u0627\u0641\u0629 (", items.length, ")"] }), !items.length ? (_jsx(EmptyState, { title: "\u0644\u0645 \u062A\u0636\u0641 \u0623\u0633\u0626\u0644\u0629 \u0628\u0639\u062F", description: "\u0627\u0628\u062F\u0623 \u0628\u0625\u0636\u0627\u0641\u0629 \u0623\u0648\u0644 \u0633\u0624\u0627\u0644 \u0634\u0627\u0626\u0639 \u0645\u0639 \u0625\u062C\u0627\u0628\u062A\u0647 \u0644\u064A\u0633\u062A\u0641\u064A\u062F \u0645\u0646\u0647 \u0627\u0644\u0645\u0648\u0627\u0637\u0646\u0648\u0646." })) : (_jsx("div", { className: "space-y-3", children: items.map((item) => (_jsxs("div", { className: "rounded-2xl border border-border bg-subtle/50 p-4", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("p", { className: "flex items-start gap-2 text-sm font-bold text-ink", children: [_jsx(Search, { className: "mt-0.5 size-4 shrink-0 text-primary" }), item.question] }), _jsx("button", { onClick: () => setDeleting(item), title: "\u062D\u0630\u0641", className: "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:border-error hover:text-error", children: _jsx(Trash2, { className: "size-4" }) })] }), _jsx("p", { className: "mt-2 line-clamp-2 whitespace-pre-line text-xs leading-6 text-muted", children: item.answer }), _jsx("p", { className: "mt-2 text-[10px] font-bold text-muted", children: formatDate(item.created_at) })] }, item.id))) }))] }) })] })), _jsx(ConfirmDialog, { open: deleting !== null, onClose: () => setDeleting(null), onConfirm: () => void remove(), title: "\u062D\u0630\u0641 \u0627\u0644\u0633\u0624\u0627\u0644", message: `هل أنت متأكد من حذف «${deleting?.question ?? ''}»؟ لن يظهر جوابه للمواطن بعد الحذف.`, loading: false })] }));
}
function cnCount(count, limit) {
    return count >= limit ? 'text-error' : 'text-primary';
}
function cnBar(pct) {
    return pct >= 100 ? 'h-full rounded-full bg-error' : 'h-full rounded-full bg-primary';
}
