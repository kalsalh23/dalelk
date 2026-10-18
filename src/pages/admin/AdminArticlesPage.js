import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Pencil, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { compressImage, deleteImage, uploadImage } from '@/services/admin';
import { Input, Select, Textarea, Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import { Skeletons, EmptyState } from '@/components/ui/States';
import { Pagination } from '@/components/ui/Pagination';
import { useToast } from '@/components/ui/Toast';
import { cn, slugify } from '@/lib/utils';
import { getPublicUrl } from '@/lib/supabase';
export function AdminArticlesPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const qc = useQueryClient();
    const toast = useToast();
    const PAGE_SIZE = 10;
    const { data, isLoading } = useQuery({
        queryKey: ['admin-articles', search, page],
        queryFn: async () => {
            let q = supabase.from('articles').select('*', { count: 'exact' });
            if (search)
                q = q.ilike('title', `%${search}%`);
            q = q.order('published_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
            const { data, count } = await q;
            return { data: (data ?? []), count: count ?? 0 };
        },
    });
    const { data: categories } = useQuery({
        queryKey: ['admin-article-cats'],
        queryFn: async () => {
            const { data } = await supabase.from('categories').select('*').eq('type', 'article').order('sort_order');
            return (data ?? []);
        },
    });
    const del = useMutation({
        mutationFn: async (row) => {
            await deleteImage(row.image);
            const { error } = await supabase.from('articles').delete().eq('id', String(row.id));
            if (error)
                throw error;
        },
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-articles'] }); toast.show('تم حذف المقال'); setDeleting(null); },
        onError: () => toast.show('تعذر الحذف', 'error'),
    });
    const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0627\u0644\u0646\u0635\u0627\u0626\u062D \u0627\u0644\u0637\u0628\u064A\u0629" }), _jsxs("p", { className: "mt-0.5 text-sm text-muted", children: [data?.count ?? '…', " \u0645\u0642\u0627\u0644"] })] }), _jsxs(Button, { onClick: () => setEditing({}), children: [_jsx(Plus, { className: "size-4.5" }), " \u0645\u0642\u0627\u0644 \u062C\u062F\u064A\u062F"] })] }), _jsxs("div", { className: "relative max-w-sm", children: [_jsx(Search, { className: "absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" }), _jsx(Input, { value: search, onChange: (e) => { setSearch(e.target.value); setPage(1); }, placeholder: "\u0628\u062D\u062B \u0628\u0627\u0644\u0639\u0646\u0648\u0627\u0646\u2026", className: "pr-11" })] }), isLoading ? (_jsx(Skeletons, { rows: 5, box: "!p-5" })) : !data?.data.length ? (_jsx(EmptyState, { title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0642\u0627\u0644\u0627\u062A" })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "space-y-2", children: data.data.map((a) => (_jsxs(Card, { className: "flex items-center gap-4 p-4", children: [_jsx("div", { className: "h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-primary-light/40", children: a.image ? _jsx("img", { src: getPublicUrl(a.image) ?? '', alt: "", className: "h-full w-full object-cover" }) : null }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate font-bold text-ink", children: String(a.title) }), _jsxs("p", { className: "mt-0.5 flex items-center gap-2 text-xs text-muted", children: [_jsx("span", { className: cn('rounded-full px-2 py-0.5 text-[10px] font-bold', a.is_published ? 'bg-emerald-50 text-success' : 'bg-slate-100 text-muted'), children: a.is_published ? 'منشور' : 'مسودة' }), _jsx("span", { children: categories?.find((c) => c.id === a.category_id)?.name ?? 'عام' })] })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("button", { onClick: () => setEditing({ ...a }), className: "flex size-9 items-center justify-center rounded-xl border border-border text-muted hover:border-primary hover:text-primary cursor-pointer", children: _jsx(Pencil, { className: "size-4" }) }), _jsx("button", { onClick: () => setDeleting(a), className: "flex size-9 items-center justify-center rounded-xl border border-border text-muted hover:border-error hover:text-error cursor-pointer", children: _jsx(Trash2, { className: "size-4" }) })] })] }, String(a.id)))) }), _jsx(Pagination, { page: page, totalPages: totalPages, onChange: setPage })] })), editing !== null && (_jsx(ArticleForm, { values: editing, categories: categories ?? [], onClose: () => setEditing(null), onDone: () => { setEditing(null); void qc.invalidateQueries({ queryKey: ['admin-articles'] }); } })), _jsx(ConfirmDialog, { open: deleting !== null, onClose: () => setDeleting(null), onConfirm: () => deleting && del.mutate(deleting), title: "\u062D\u0630\u0641 \u0627\u0644\u0645\u0642\u0627\u0644", message: `حذف «${String(deleting?.title ?? '')}» نهائياً؟`, loading: del.isPending })] }));
}
function ArticleForm({ values, categories, onClose, onDone }) {
    const [form, setForm] = useState({ ...values });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const toast = useToast();
    const isEdit = Boolean(values.id);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (!String(form.title ?? '').trim()) {
            setError('العنوان مطلوب');
            return;
        }
        setSaving(true);
        const payload = {
            title: String(form.title ?? '').trim(),
            slug: String(form.slug ?? '').trim() || slugify(String(form.title ?? '')),
            excerpt: String(form.excerpt ?? '').trim() || null,
            content: String(form.content ?? ''),
            category_id: String(form.category_id ?? '') || null,
            image: form.image ?? null,
            is_published: Boolean(form.is_published),
            is_featured: Boolean(form.is_featured),
            seo_title: String(form.seo_title ?? '').trim() || null,
            seo_description: String(form.seo_description ?? '').trim() || null,
            published_at: form.published_at ?? new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        const result = isEdit
            ? await supabase.from('articles').update(payload).eq('id', String(values.id)).select().single()
            : await supabase.from('articles').insert(payload).select().single();
        setSaving(false);
        if (result.error) {
            setError(result.error.message);
            return;
        }
        toast.show(isEdit ? 'تم حفظ التعديلات' : 'تم نشر المقال');
        onDone();
    };
    const upload = async (files) => {
        if (!files?.length)
            return;
        setSaving(true);
        try {
            const compressed = await compressImage(files[0]);
            const path = await uploadImage('clinic', compressed);
            set('image', path);
            toast.show('تم رفع الصورة');
        }
        catch {
            toast.show('تعذر رفع الصورة', 'error');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsx(Dialog, { open: true, onClose: onClose, title: isEdit ? 'تعديل المقال' : 'مقال جديد', size: "xl", children: _jsxs("form", { onSubmit: submit, className: "space-y-5", children: [_jsx(Field, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", required: true, children: _jsx(Input, { value: String(form.title ?? ''), onChange: (e) => set('title', e.target.value), required: true }) }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "\u0627\u0644\u062A\u0635\u0646\u064A\u0641", children: _jsxs(Select, { value: String(form.category_id ?? ''), onChange: (e) => set('category_id', e.target.value), children: [_jsx("option", { value: "", children: "\u0639\u0627\u0645" }), categories.map((c) => _jsx("option", { value: c.id, children: c.name }, c.id))] }) }), _jsx(Field, { label: "\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u062E\u062A\u0635\u0631 (Slug)", children: _jsx(Input, { value: String(form.slug ?? ''), onChange: (e) => set('slug', e.target.value), placeholder: "\u064A\u064F\u0648\u0644\u0651\u062F \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B", dir: "ltr" }) })] }), _jsx(Field, { label: "\u0627\u0644\u0645\u0644\u062E\u0635 (Excerpt)", children: _jsx(Textarea, { rows: 2, value: String(form.excerpt ?? ''), onChange: (e) => set('excerpt', e.target.value) }) }), _jsx(Field, { label: "\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u0642\u0627\u0644 (\u064A\u062F\u0639\u0645 HTML)", children: _jsx(Textarea, { rows: 10, value: String(form.content ?? ''), onChange: (e) => set('content', e.target.value), placeholder: "<h2>\u0627\u0644\u0639\u0646\u0648\u0627\u0646</h2><p>\u0646\u0635 \u0627\u0644\u0641\u0642\u0631\u0629\u2026</p>", dir: "auto" }) }), _jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsx(Field, { label: "SEO Title", children: _jsx(Input, { value: String(form.seo_title ?? ''), onChange: (e) => set('seo_title', e.target.value) }) }), _jsx(Field, { label: "Meta Description", children: _jsx(Input, { value: String(form.seo_description ?? ''), onChange: (e) => set('seo_description', e.target.value) }) })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-2 text-sm font-semibold text-ink", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0642\u0627\u0644" }), _jsx("div", { className: "flex flex-wrap items-center gap-3", children: form.image ? (_jsxs("div", { className: "relative", children: [_jsx("img", { src: getPublicUrl(form.image) ?? '', alt: "", className: "h-24 w-36 rounded-xl object-cover" }), _jsx("button", { type: "button", onClick: () => { void deleteImage(form.image); set('image', null); }, className: "absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-full bg-error text-white cursor-pointer", children: _jsx(X, { className: "size-3.5" }) })] })) : (_jsxs("label", { className: "flex h-24 w-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary", children: [_jsx(Upload, { className: "size-6" }), _jsx("span", { className: "text-[10px] font-bold", children: "\u0631\u0641\u0639 \u0635\u0648\u0631\u0629" }), _jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => void upload(e.target.files) })] })) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("label", { className: cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold', form.is_published ? 'border-primary bg-primary-light/50 text-primary-dark' : 'border-border text-muted'), children: [_jsx("input", { type: "checkbox", className: "hidden", checked: Boolean(form.is_published), onChange: (e) => set('is_published', e.target.checked) }), "\u0645\u0646\u0634\u0648\u0631 ", Boolean(form.is_published) && '✓'] }), _jsxs("label", { className: cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold', form.is_featured ? 'border-primary bg-primary-light/50 text-primary-dark' : 'border-border text-muted'), children: [_jsx("input", { type: "checkbox", className: "hidden", checked: Boolean(form.is_featured), onChange: (e) => set('is_featured', e.target.checked) }), "\u0645\u0645\u064A\u0651\u0632 ", Boolean(form.is_featured) && '✓'] })] }), error && _jsx("p", { className: "rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-error", children: error }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "submit", loading: saving, className: "flex-1", children: isEdit ? 'حفظ التعديلات' : 'نشر المقال' }), _jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "\u0625\u0644\u063A\u0627\u0621" })] })] }) }));
}
