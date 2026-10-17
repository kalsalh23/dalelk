import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Moon, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog';
import { Skeletons, EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { formatDateShort, formatDutyTime } from '@/lib/utils';
export function AdminDutyPage() {
    const qc = useQueryClient();
    const toast = useToast();
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const { data: duties, isLoading } = useQuery({
        queryKey: ['admin-duty'],
        queryFn: async () => {
            const { data } = await supabase
                .from('duty_pharmacies')
                .select('*, pharmacies(name)')
                .order('start_date', { ascending: false });
            return (data ?? []).map((d) => ({ ...d, pharmacyName: d.pharmacies?.name ?? '—' }));
        },
    });
    const { data: pharmacies } = useQuery({
        queryKey: ['admin-duty-pharmacies'],
        queryFn: async () => {
            const { data } = await supabase.from('pharmacies').select('id, name').eq('is_active', true).order('name');
            return (data ?? []);
        },
    });
    const del = useMutation({
        mutationFn: async (row) => {
            const { error } = await supabase.from('duty_pharmacies').delete().eq('id', String(row.id));
            if (error)
                throw error;
        },
        onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-duty'] }); toast.show('تم الحذف'); setDeleting(null); },
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-black text-ink", children: "\u0627\u0644\u0635\u064A\u062F\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629" }), _jsx("p", { className: "mt-0.5 text-sm text-muted", children: "\u062D\u062F\u062F \u0627\u0644\u0635\u064A\u062F\u0644\u064A\u0629 \u0648\u062A\u0627\u0631\u064A\u062E \u0628\u062F\u0627\u064A\u0629 \u0648\u0646\u0647\u0627\u064A\u0629 \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629 \u0648\u0633\u0627\u0639\u0627\u062A\u0647\u0627" })] }), _jsxs(Button, { onClick: () => setEditing({}), children: [_jsx(Plus, { className: "size-4.5" }), " \u0645\u0646\u0627\u0648\u0628\u0629 \u062C\u062F\u064A\u062F\u0629"] })] }), isLoading ? (_jsx(Skeletons, { rows: 4, box: "!p-5" })) : !duties?.length ? (_jsx(EmptyState, { title: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u0627\u0648\u0628\u0627\u062A", description: "\u0623\u0636\u0641 \u0623\u0648\u0644 \u0645\u0646\u0627\u0648\u0628\u0629 \u0644\u062A\u0638\u0647\u0631 \u0641\u064A \u0642\u0633\u0645 \u00AB\u0627\u0644\u0635\u064A\u062F\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629\u00BB." })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: duties.map((d) => (_jsx(Card, { className: "p-5", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "flex items-center gap-1.5 font-black text-ink", children: [_jsx(Moon, { className: "size-4 text-primary" }), String(d.pharmacyName)] }), _jsxs("p", { className: "mt-2 text-xs text-muted", children: ["\u0645\u0646 ", formatDateShort(String(d.start_date)), " \u2014 \u062D\u062A\u0649 ", formatDateShort(String(d.end_date))] }), d.open_time || d.close_time ? (_jsxs("p", { className: "mt-1 text-sm font-bold text-primary-dark", children: [_jsx(Clock, { className: "inline size-4" }), " ", formatDutyTime(String(d.open_time ?? ''), String(d.close_time ?? ''))] })) : null, d.duty_hours ? _jsx("p", { className: "mt-1 text-sm font-bold text-primary-dark", children: String(d.duty_hours) }) : null] }), _jsxs("div", { className: "flex gap-1.5", children: [_jsx("button", { onClick: () => setEditing({ ...d }), className: "flex size-8 items-center justify-center rounded-lg border border-border text-muted hover:border-primary hover:text-primary cursor-pointer", children: "\u270E" }), _jsx("button", { onClick: () => setDeleting(d), className: "flex size-8 items-center justify-center rounded-lg border border-border text-muted hover:border-error hover:text-error cursor-pointer", children: _jsx(Trash2, { className: "size-4" }) })] })] }) }, String(d.id)))) })), editing !== null && (_jsx(DutyForm, { values: editing, pharmacies: pharmacies ?? [], onClose: () => setEditing(null), onDone: () => { setEditing(null); void qc.invalidateQueries({ queryKey: ['admin-duty'] }); } })), _jsx(ConfirmDialog, { open: deleting !== null, onClose: () => setDeleting(null), onConfirm: () => deleting && del.mutate(deleting), title: "\u062D\u0630\u0641 \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629", message: "\u062A\u0623\u0643\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0647 \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629\u061F", loading: del.isPending })] }));
}
function DutyForm({ values, pharmacies, onClose, onDone }) {
    const [form, setForm] = useState({ ...values });
    const [saving, setSaving] = useState(false);
    const toast = useToast();
    const isEdit = Boolean(values.id);
    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        let openTime = String(form.open_time ?? '').trim();
        let dutyHoursStr = String(form.duty_hours ?? '').trim();
        let closeTime = String(form.close_time ?? '').trim();
        if (openTime && dutyHoursStr) {
            const hours = parseFloat(dutyHoursStr);
            if (!isNaN(hours)) {
                const parts = openTime.split(':').map(Number);
                let totalMinutes = parts[0] * 60 + parts[1] + hours * 60;
                totalMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
                const newHours = Math.floor(totalMinutes / 60);
                const newMinutes = totalMinutes % 60;
                closeTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
            }
        }
        const payload = {
            pharmacy_id: String(form.pharmacy_id ?? ''),
            city_id: null,
            start_date: String(form.start_date ?? ''),
            end_date: String(form.end_date ?? ''),
            duty_hours: dutyHoursStr || null,
            open_time: openTime || null,
            close_time: closeTime || null,
            notes: String(form.notes ?? '').trim() || null,
            is_active: true,
            updated_at: new Date().toISOString(),
        };
        const result = isEdit
            ? await supabase.from('duty_pharmacies').update(payload).eq('id', String(values.id))
            : await supabase.from('duty_pharmacies').insert(payload);
        setSaving(false);
        if (result.error) {
            console.error('Save error:', result.error);
            toast.show(`تعذر الحفظ: ${result.error.message ?? JSON.stringify(result.error)}`, 'error');
            return;
        }
        toast.show('تم حفظ المناوبة');
        onDone();
    };
    return (_jsx(Dialog, { open: true, onClose: onClose, title: isEdit ? 'تعديل المناوبة' : 'مناوبة جديدة', size: "md", children: _jsxs("form", { onSubmit: submit, className: "space-y-5", children: [_jsx(Field, { label: "\u0627\u0644\u0635\u064A\u062F\u0644\u064A\u0629", required: true, children: _jsxs(Select, { value: String(form.pharmacy_id ?? ''), onChange: (e) => set('pharmacy_id', e.target.value), required: true, children: [_jsx("option", { value: "", children: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0635\u064A\u062F\u0644\u064A\u0629\u2026" }), pharmacies.map((p) => _jsx("option", { value: p.id, children: p.name }, p.id))] }) }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Field, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0627\u064A\u0629", required: true, children: _jsx(Input, { type: "date", value: String(form.start_date ?? ''), onChange: (e) => set('start_date', e.target.value), required: true }) }), _jsx(Field, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0646\u0647\u0627\u064A\u0629", required: true, children: _jsx(Input, { type: "date", value: String(form.end_date ?? ''), onChange: (e) => set('end_date', e.target.value), required: true }) })] }), _jsx(Field, { label: "\u0648\u0642\u062A \u0627\u0644\u0627\u0641\u062A\u062A\u0627\u062D", children: _jsx(Input, { type: "time", value: String(form.open_time ?? ''), onChange: (e) => set('open_time', e.target.value) }) }), _jsx(Field, { label: "\u0639\u062F\u062F \u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0639\u0645\u0644", children: _jsx(Input, { type: "number", value: String(form.duty_hours ?? ''), onChange: (e) => set('duty_hours', e.target.value) }) }), _jsx(Field, { label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", children: _jsx(Textarea, { rows: 2, value: String(form.notes ?? ''), onChange: (e) => set('notes', e.target.value) }) }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "submit", loading: saving, className: "flex-1", children: isEdit ? 'حفظ' : 'إضافة' }), _jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "\u0625\u0644\u063A\u0627\u0621" })] })] }) }));
}
