import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Moon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog'
import { Skeletons, EmptyState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { formatDateShort } from '@/lib/utils'

export function AdminDutyPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null)

  const { data: duties, isLoading } = useQuery({
    queryKey: ['admin-duty'],
    queryFn: async () => {
      const { data } = await supabase
        .from('duty_pharmacies')
        .select('*, pharmacies(name)')
        .order('start_date', { ascending: false })
      return (data ?? []).map((d) => ({ ...d, pharmacyName: (d.pharmacies as { name?: string } | null)?.name ?? '—' }))
    },
  })

  const { data: pharmacies } = useQuery({
    queryKey: ['admin-duty-pharmacies'],
    queryFn: async () => {
      const { data } = await supabase.from('pharmacies').select('id, name').eq('is_active', true).order('name')
      return (data ?? []) as Array<{ id: string; name: string }>
    },
  })

  const del = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const { error } = await supabase.from('duty_pharmacies').delete().eq('id', String(row.id))
      if (error) throw error
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-duty'] }); toast.show('تم الحذف'); setDeleting(null) },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">الصيدليات المناوبة</h1>
          <p className="mt-0.5 text-sm text-muted">حدد الصيدلية وتاريخ بداية ونهاية المناوبة وساعاتها</p>
        </div>
        <Button onClick={() => setEditing({})}><Plus className="size-4.5" /> مناوبة جديدة</Button>
      </div>

      {isLoading ? (
        <Skeletons rows={4} box="!p-5" />
      ) : !duties?.length ? (
        <EmptyState title="لا توجد مناوبات" description="أضف أول مناوبة لتظهر في قسم «الصيدليات المناوبة»." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {duties.map((d) => (
            <Card key={String(d.id)} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-1.5 font-black text-ink"><Moon className="size-4 text-primary" />{String(d.pharmacyName)}</p>
                  <p className="mt-2 text-xs text-muted">
                    من {formatDateShort(String(d.start_date))} — حتى {formatDateShort(String(d.end_date))}
                  </p>
                  <p className="mt-1 text-sm font-bold text-primary-dark">{String(d.duty_hours ?? 'خلال الليل')}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setEditing({ ...d })} className="flex size-8 items-center justify-center rounded-lg border border-border text-muted hover:border-primary hover:text-primary cursor-pointer">✎</button>
                  <button onClick={() => setDeleting(d)} className="flex size-8 items-center justify-center rounded-lg border border-border text-muted hover:border-error hover:text-error cursor-pointer"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing !== null && (
        <DutyForm
          values={editing}
          pharmacies={pharmacies ?? []}
          onClose={() => setEditing(null)}
          onDone={() => { setEditing(null); void qc.invalidateQueries({ queryKey: ['admin-duty'] }) }}
        />
      )}
      <ConfirmDialog open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={() => deleting && del.mutate(deleting)} title="حذف المناوبة" message="تأكيد حذف هذه المناوبة؟" loading={del.isPending} />
    </div>
  )
}

function DutyForm({ values, pharmacies, onClose, onDone }: {
  values: Record<string, unknown>
  pharmacies: Array<{ id: string; name: string }>
  onClose: () => void
  onDone: () => void
}) {
  const [form, setForm] = useState({ ...values })
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const isEdit = Boolean(values.id)
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      pharmacy_id: String(form.pharmacy_id ?? ''),
      city_id: null,
      start_date: String(form.start_date ?? ''),
      end_date: String(form.end_date ?? ''),
      duty_hours: String(form.duty_hours ?? '').trim() || null,
      notes: String(form.notes ?? '').trim() || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    }
    const result = isEdit
      ? await supabase.from('duty_pharmacies').update(payload).eq('id', String(values.id))
      : await supabase.from('duty_pharmacies').insert(payload)
    setSaving(false)
    if (result.error) { toast.show('تعذر الحفظ', 'error'); return }
    toast.show('تم حفظ المناوبة')
    onDone()
  }

  return (
    <Dialog open onClose={onClose} title={isEdit ? 'تعديل المناوبة' : 'مناوبة جديدة'} size="md">
      <form onSubmit={submit} className="space-y-5">
        <Field label="الصيدلية" required>
          <Select value={String(form.pharmacy_id ?? '')} onChange={(e) => set('pharmacy_id', e.target.value)} required>
            <option value="">اختر الصيدلية…</option>
            {pharmacies.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="تاريخ البداية" required>
            <Input type="date" value={String(form.start_date ?? '')} onChange={(e) => set('start_date', e.target.value)} required />
          </Field>
          <Field label="تاريخ النهاية" required>
            <Input type="date" value={String(form.end_date ?? '')} onChange={(e) => set('end_date', e.target.value)} required />
          </Field>
        </div>
        <Field label="ساعات المناوبة">
          <Input value={String(form.duty_hours ?? '')} placeholder="مثال: 8 مساءً حتى 8 صباحاً" onChange={(e) => set('duty_hours', e.target.value)} />
        </Field>
        <Field label="ملاحظات">
          <Textarea rows={2} value={String(form.notes ?? '')} onChange={(e) => set('notes', e.target.value)} />
        </Field>
        <div className="flex gap-3">
          <Button type="submit" loading={saving} className="flex-1">{isEdit ? 'حفظ' : 'إضافة'}</Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Dialog>
  )
}