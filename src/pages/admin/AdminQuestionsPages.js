import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, CheckCircle2, Send, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import { Skeletons, EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { ARTICLE_CATEGORIES } from '@/constants';
export function AdminQuestionsPage() {
    const qc = useQueryClient();
    const toast = useToast();
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const { data, isLoading } = useQuery({
        queryKey: ['admin-questions', page],
        queryFn: async () => {
            const { data, count } = await supabase
                .from('medical_questions')
                .select('*, medical_keywords(keyword)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
            return {
                data: (data ?? []).map((d) => ({
                    ...d,
                    keywords: (d.medical_keywords ?? []).map((k) => k.keyword).join('، '),
                })),
                count: count ?? 0,
            };
        },
    });
    const del = useMutation({
        mutationFn: async (row) => {
            await supabase.from('medical_keywords').delete().eq('question_id', String(row.id));
            await supabase.from('medical_questions').delete().eq('id', String(row.id));
        },
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-questions'] }); toast.show('تم الحذف'); setDeleting(null); },
        onError: () => toast.show('تعذر الحذف', 'error'),
    });
    const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0648\u0627\u0644\u0623\u062C\u0648\u0628\u0629" }), _jsxs("p", { className: "mt-0.5 text-sm text-muted", children: ["\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0637\u0628\u064A\u0629 \u2014 ", data?.count ?? '…', " \u0633\u0624\u0627\u0644"] })] }), _jsxs(Button, { onClick: () => setEditing({}), children: [_jsx(Plus, { className: "size-4.5" }), " \u0633\u0624\u0627\u0644 \u062C\u062F\u064A\u062F"] })] }), _jsx("div", { className: "rounded-2xl border border-primary/20 bg-primary-light/30 px-4 py-3 text-sm text-primary-dark", children: "\u0643\u0644 \u0633\u0624\u0627\u0644 \u064A\u062F\u0639\u0645 \u0639\u062F\u062F \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F \u0645\u0646 \u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0645\u0641\u062A\u0627\u062D\u064A\u0629\u060C \u0648\u062A\u064F\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0622\u0646 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u062F\u0627\u062E\u0644 \u00AB\u0627\u0633\u0623\u0644 \u062F\u0644\u064A\u0644\u0643\u00BB." }), isLoading ? (_jsx(Skeletons, { rows: 5, box: "!p-5" })) : !data?.data.length ? (_jsx(EmptyState, { title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u0633\u0626\u0644\u0629", description: "\u0623\u0636\u0641 \u0623\u0648\u0644 \u0633\u0624\u0627\u0644 \u0648\u0625\u062C\u0627\u0628\u0629 \u0625\u0644\u0649 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0645\u0639\u0631\u0641\u0629." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "space-y-2", children: data.data.map((q) => (_jsxs(Card, { className: "flex items-center gap-4 p-4", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("p", { className: "font-bold text-ink", children: String(q.question) }), _jsx("span", { className: cn('rounded-full px-2 py-0.5 text-[10px] font-bold', q.is_active ? 'bg-emerald-50 text-success' : 'bg-subtle-strong text-muted'), children: q.is_active ? 'مفعّل' : 'مخفّي' })] }), _jsx("p", { className: "mt-1 line-clamp-1 text-xs text-muted", children: String(q.answer ?? '') }), q.keywords ? _jsxs("p", { className: "mt-1 text-[11px] text-primary-dark", children: ["\u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0645\u0641\u062A\u0627\u062D\u064A\u0629: ", String(q.keywords)] }) : null] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("button", { onClick: () => setEditing({ ...q }), className: "flex size-9 items-center justify-center rounded-xl border border-border text-muted hover:border-primary hover:text-primary cursor-pointer", children: _jsx(Pencil, { className: "size-4" }) }), _jsx("button", { onClick: () => setDeleting(q), className: "flex size-9 items-center justify-center rounded-xl border border-border text-muted hover:border-error hover:text-error cursor-pointer", children: _jsx(Trash2, { className: "size-4" }) })] })] }, String(q.id)))) }), _jsx(Pagination, { page: page, totalPages: totalPages, onChange: setPage })] })), editing !== null && (_jsx(QuestionForm, { values: editing, onClose: () => setEditing(null), onDone: () => { setEditing(null); void qc.invalidateQueries({ queryKey: ['admin-questions'] }); } })), _jsx(ConfirmDialog, { open: deleting !== null, onClose: () => setDeleting(null), onConfirm: () => deleting && del.mutate(deleting), title: "\u062D\u0630\u0641 \u0627\u0644\u0633\u0624\u0627\u0644", message: `حذف «${String(deleting?.question ?? '')}» وجميع كلماته المفتاحية؟`, loading: del.isPending })] }));
}
function QuestionForm({ values, onClose, onDone }) {
    const [form, setForm] = useState({ ...values });
    const [keywords, setKeywords] = useState(String(values.keywords ?? '').split('،').join('\n'));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const toast = useToast();
    const isEdit = Boolean(values.id);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!String(form.question ?? '').trim() || !String(form.answer ?? '').trim()) {
            setError('السؤال والإجابة مطلوبان');
            return;
        }
        setSaving(true);
        const qPayload = {
            question: String(form.question ?? '').trim(),
            answer: String(form.answer ?? '').trim(),
            category_id: String(form.category_id ?? '') || null,
            is_active: Boolean(form.is_active),
            updated_at: new Date().toISOString(),
        };
        const kw = keywords.split('\n').map((k) => k.trim()).filter(Boolean);
        let qResult;
        if (isEdit) {
            qResult = await supabase.from('medical_questions').update(qPayload).eq('id', String(values.id)).select().single();
            await supabase.from('medical_keywords').delete().eq('question_id', String(values.id));
        }
        else {
            qResult = await supabase.from('medical_questions').insert(qPayload).select().single();
        }
        if (qResult.error) {
            setSaving(false);
            setError(qResult.error.message);
            return;
        }
        if (kw.length && qResult.data) {
            await supabase.from('medical_keywords').insert(kw.map((keyword) => ({ question_id: qResult.data.id, keyword })));
        }
        setSaving(false);
        toast.show(isEdit ? 'تم حفظ السؤال' : 'تمت الإضافة');
        onDone();
    };
    return (_jsx(Dialog, { open: true, onClose: onClose, title: isEdit ? 'تعديل السؤال' : 'سؤال جديد', size: "lg", children: _jsxs("form", { onSubmit: submit, className: "space-y-5", children: [_jsx(Field, { label: "\u0627\u0644\u0633\u0624\u0627\u0644", required: true, children: _jsx(Input, { value: String(form.question ?? ''), onChange: (e) => set('question', e.target.value), required: true }) }), _jsx(Field, { label: "\u0627\u0644\u0625\u062C\u0627\u0628\u0629", required: true, children: _jsx(Textarea, { rows: 6, value: String(form.answer ?? ''), onChange: (e) => set('answer', e.target.value) }) }), _jsx(Field, { label: "\u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0645\u0641\u062A\u0627\u062D\u064A\u0629 (\u0643\u0644 \u0643\u0644\u0645\u0629 \u0641\u064A \u0633\u0637\u0631)", hint: "\u0639\u0644\u0649 \u0633\u0628\u064A\u0644 \u0627\u0644\u0645\u062B\u0627\u0644: \u0633\u0639\u0627\u0644\u060C \u0643\u062D\u0629\u060C \u0643\u062D\u0647\u060C \u0633\u0639\u0627\u0644 \u062C\u0627\u0641 \u2014 \u062A\u064F\u0633\u062A\u062E\u062F\u0645 \u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u0633\u0624\u0627\u0644.", children: _jsx(Textarea, { rows: 4, value: keywords, onChange: (e) => setKeywords(e.target.value) }) }), _jsx(Field, { label: "\u0627\u0644\u062A\u0635\u0646\u064A\u0641", children: _jsxs("select", { value: String(form.category_id ?? ''), onChange: (e) => set('category_id', e.target.value), className: "h-11 w-full cursor-pointer rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15", children: [_jsx("option", { value: "", children: "\u2014 \u0628\u062F\u0648\u0646 \u062A\u0635\u0646\u064A\u0641 \u2014" }), ARTICLE_CATEGORIES.map((c) => _jsx("option", { value: c, children: c }, c))] }) }), _jsxs("label", { className: cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold', form.is_active ? 'border-primary bg-primary-light/50 text-primary-dark' : 'border-border text-muted'), children: [_jsx("input", { type: "checkbox", className: "hidden", checked: Boolean(form.is_active), onChange: (e) => set('is_active', e.target.checked) }), _jsx(CheckCircle2, { className: cn('size-4.5', form.is_active ? 'text-success' : 'text-muted') }), "\u0627\u0644\u0633\u0624\u0627\u0644 \u0645\u0641\u0639\u0651\u0644 \u0648\u064A\u0638\u0647\u0631 \u0641\u064A \u0646\u062A\u0627\u0626\u062C \u00AB\u0627\u0633\u0623\u0644 \u062F\u0644\u064A\u0644\u0643\u00BB"] }), error && _jsx("p", { className: "rounded-xl bg-wine-soft px-3 py-2.5 text-xs font-semibold text-error", children: error }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "submit", loading: saving, className: "flex-1", children: isEdit ? 'حفظ التعديلات' : 'إضافة السؤال' }), _jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "\u0625\u0644\u063A\u0627\u0621" })] })] }) }));
}
export function AdminUnansweredPage() {
    const qc = useQueryClient();
    const toast = useToast();
    const [page, setPage] = useState(1);
    const [answers, setAnswers] = useState({});
    const PAGE_SIZE = 10;
    const { data, isLoading } = useQuery({
        queryKey: ['admin-unanswered', page],
        queryFn: async () => {
            const { data, count } = await supabase
                .from('unanswered_questions')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
            return { data: (data ?? []), count: count ?? 0 };
        },
    });
    const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));
    const answerMutation = useMutation({
        mutationFn: async (row) => {
            const answer = answers[String(row.id)]?.trim();
            if (!answer)
                throw new Error('أدخل الإجابة أولاً');
            const { data: qRes, error } = await supabase
                .from('medical_questions')
                .insert({ question: String(row.question), answer })
                .select()
                .single();
            if (error)
                throw error;
            await supabase.from('medical_keywords').insert([{ question_id: qRes.id, keyword: String(row.question) }]);
            await supabase.from('unanswered_questions').delete().eq('id', String(row.id));
        },
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-unanswered'] }); void qc.invalidateQueries({ queryKey: ['admin-questions'] }); toast.show('تم تحويله لسؤال مجاب'); },
    });
    const del = useMutation({
        mutationFn: async (row) => {
            await supabase.from('unanswered_questions').delete().eq('id', String(row.id));
        },
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-unanswered'] }); toast.show('تم حذف السؤال'); },
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u063A\u064A\u0631 \u0627\u0644\u0645\u062C\u0627\u0628 \u0639\u0646\u0647\u0627" }), _jsxs("p", { className: "mt-0.5 text-sm text-muted", children: ["\u0623\u0633\u0626\u0644\u0629 \u0623\u0631\u0633\u0644\u0647\u0627 \u0627\u0644\u0632\u0648\u0627\u0631 \u0639\u0628\u0631 \u00AB\u0627\u0633\u0623\u0644 \u062F\u0644\u064A\u0644\u0643\u00BB \u0648\u0644\u0645 \u064A\u062C\u062F\u0648\u0627 \u0644\u0647\u0627 \u0625\u062C\u0627\u0628\u0629 (", data?.count ?? '…', ")"] })] }), isLoading ? (_jsx(Skeletons, { rows: 5, box: "!p-5" })) : !data?.data.length ? (_jsx(EmptyState, { title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u0633\u0626\u0644\u0629 \u0645\u0639\u0644\u0642\u0629", description: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0645\u062C\u0627\u0628 \u0639\u0646\u0647\u0627." })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "space-y-3", children: data.data.map((row) => (_jsxs(Card, { className: "p-5", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-gold-soft text-gold-dark", children: _jsx(Send, { className: "size-4.5" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-ink", children: String(row.question) }), _jsxs("p", { className: "mt-1 flex items-center gap-2 text-[11px] text-muted", children: [_jsxs("span", { children: ["\u0623\u0631\u0633\u0644 \u0641\u064A ", new Date(String(row.created_at)).toLocaleDateString('ar-SY')] }), _jsx("span", { className: "rounded-full bg-gold-soft px-2 py-0.5 font-bold text-gold-dark", children: "\u0628\u062F\u0648\u0646 \u0625\u062C\u0627\u0628\u0629" })] })] })] }), _jsx("button", { onClick: () => del.mutate(row), className: "flex size-8 items-center justify-center rounded-lg text-muted hover:bg-wine-soft hover:text-error cursor-pointer", children: _jsx(Trash2, { className: "size-4" }) })] }), _jsxs("div", { className: "mt-4 flex flex-col gap-2 sm:flex-row", children: [_jsx(Textarea, { rows: 2, placeholder: "\u0627\u0643\u062A\u0628 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0647\u0646\u0627\u2026 \u062B\u0645 \u0627\u0636\u063A\u0637 \u00AB\u0646\u0634\u0631 \u0643\u0633\u0624\u0627\u0644 \u0645\u062C\u0627\u0628\u00BB \u0644\u062A\u0635\u0628\u062D \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0645\u062A\u0627\u062D\u0629 \u0644\u0644\u0632\u0648\u0627\u0631.", value: answers[String(row.id)] ?? '', onChange: (e) => setAnswers((a) => ({ ...a, [String(row.id)]: e.target.value })), className: "flex-1" }), _jsxs(Button, { loading: answerMutation.isPending, onClick: () => answerMutation.mutate(row), className: "sm:w-auto", children: [_jsx(Save, { className: "size-4.5" }), "\u0646\u0634\u0631 \u0643\u0633\u0624\u0627\u0644 \u0645\u062C\u0627\u0628"] })] })] }, String(row.id)))) }), _jsx(Pagination, { page: page, totalPages: totalPages, onChange: setPage })] }))] }));
}
