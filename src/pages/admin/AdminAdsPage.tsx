import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Pencil, Megaphone, Link2, Eye } from 'lucide-react'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog'
import { Skeletons, EmptyState } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { fetchAllAds, createAd, updateAd, deleteAd } from '@/services/site'
import { uploadImage, deleteImage } from '@/services/admin'
import { getPublicUrl } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { Advertisement } from '@/types'

export function AdminAdsPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [deleting, setDeleting] = useState<Advertisement | null>(null)

  const { data: ads, isLoading } = useQuery({ queryKey: ['admin-ads'], queryFn: fetchAllAds })

  const del = useMutation({
    mutationFn: async (ad: Advertisement) => {
      await deleteImage(ad.image)
      const ok = await deleteAd(ad.id)
      if (!ok) throw new Error()
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-ads'] }); toast.show('تم الحذف'); setDeleting(null) },
    onError: () => toast.show('تعذر الحذف', 'error'),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">الإعلانات</h1>
          <p className="mt-0.5 text-sm text-muted">أدر الإعلانات التي تظهر على الصفحة الرئيسية وصفحة من نحن</p>
        </div>
        <Button onClick={() => setEditing({})}><Plus className="size-4.5" /> إعلان جديد</Button>
      </div>

      {isLoading ? (
        <Skeletons rows={4} box="!p-5" />
      ) : !ads?.length ? (
        <EmptyState title="لا توجد إعلانات" description="أضف أول إعلان ليظهر في القسم الإعلاني على الصفحة الرئيسية." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad) => (
            <Card key={ad.id} className={cn('overflow-hidden', !ad.is_active && 'opacity-60')}>
              {ad.image ? (
                <div className="relative h-28 w-full bg-slate-100">
                  <img src={getPublicUrl(ad.image) ?? undefined} alt={ad.title} className="h-full w-full object-cover" />
                  <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">{ad.placement === 'home' ? 'الرئيسية' : 'من نحن'}</span>
                </div>
              ) : (
                <div className="flex h-28 items-center justify-center bg-primary-light/40">
                  <Megaphone className="size-8 text-primary/60" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-black text-ink">{ad.title}</p>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', ad.is_active ? 'bg-emerald-50 text-success' : 'bg-slate-100 text-muted')}>
                    {ad.is_active ? 'مفعّل' : 'معطّل'}
                  </span>
                </div>
                {ad.description && <p className="mt-1 line-clamp-2 text-xs text-muted">{ad.description}</p>}
                {ad.link && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-primary" dir="ltr">
                    <Link2 className="size-3 shrink-0" />
                    {ad.link.slice(0, 40)}{ad.link.length > 40 ? '…' : ''}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted">{ad.clicks ?? 0} نقرة</span>
                  <div className="flex gap-1.5">
                    <button onClick={() => setEditing({ ...ad })} className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border text-muted hover:border-primary hover:text-primary"><Pencil className="size-3.5" /></button>
                    <button onClick={() => setDeleting(ad)} className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border text-muted hover:border-error hover:text-error"><Trash2 className="size-3.5" /></button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing !== null && (
        <AdForm
          values={editing}
          onClose={() => setEditing(null)}
          onDone={() => { setEditing(null); void qc.invalidateQueries({ queryKey: ['admin-ads'] }) }}
        />
      )}
      <ConfirmDialog open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={() => deleting && del.mutate(deleting)} title="حذف الإعلان" message="تأكيد حذف هذا الإعلان؟" loading={del.isPending} />
    </div>
  )
}

function AdForm({ values, onClose, onDone }: {
  values: Record<string, unknown>
  onClose: () => void
  onDone: () => void
}) {
  const [form, setForm] = useState({ title: '', description: '', link: '', placement: 'home', image: '', is_active: true, sort_order: 0, ...values })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const toast = useToast()
  const isEdit = Boolean(values.id)
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const pickImage = async (file: File | null | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const compressed = await uploadImage('doctor', file) // نفس الـ bucket — المسار عادي
      if (compressed) {
        const path = compressed
        if (form.image && !String(form.image).startsWith('http') && !String(form.image).startsWith('/')) await deleteImage(String(form.image))
        set('image', path)
        toast.show('تم رفع الصورة')
      }
    } catch {
      toast.show('تعذر رفع الصورة', 'error')
    } finally {
      setUploading(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      title: String(form.title).trim(),
      description: String(form.description ?? '').trim() || null,
      link: String(form.link ?? '').trim() || null,
      placement: String(form.placement),
      image: String(form.image ?? '') || null,
      is_active: Boolean(form.is_active),
      sort_order: Number(form.sort_order ?? 0) || 0,
    }
    const ok = isEdit
      ? await updateAd(String(values.id), payload)
      : await createAd(payload)
    setSaving(false)
    if (!ok) { toast.show('تعذر الحفظ', 'error'); return }
    toast.show(isEdit ? 'تم التحديث' : 'تمت الإضافة')
    onDone()
  }

  return (
    <Dialog open onClose={onClose} title={isEdit ? 'تعديل الإعلان' : 'إعلان جديد'} size="md">
      <form onSubmit={submit} className="space-y-5">
        <Field label="العنوان" required>
          <Input value={String(form.title)} onChange={(e) => set('title', e.target.value)} required placeholder="مثال: إعلان عيادة جديدة" />
        </Field>
        <Field label="الوصف">
          <Textarea rows={2} value={String(form.description ?? '')} onChange={(e) => set('description', e.target.value)} />
        </Field>
        <Field label="الرابط" hint="اضغط على الإعلان يفتح هذا الرابط في نافذة جديدة (اختياري)">
          <Input type="url" value={String(form.link ?? '')} onChange={(e) => set('link', e.target.value)} placeholder="https://…" dir="ltr" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="المكان">
            <Select value={String(form.placement)} onChange={(e) => set('placement', e.target.value)}>
              <option value="home">الصفحة الرئيسية</option>
              <option value="about">صفحة من نحن</option>
            </Select>
          </Field>
          <Field label="الترتيب">
            <Input type="number" value={String(form.sort_order ?? 0)} onChange={(e) => set('sort_order', e.target.value)} />
          </Field>
        </div>
        <Field label="صورة الغلاف">
          <input
            type="file" accept="image/*"
            onChange={(e) => void pickImage(e.target.files?.[0])}
            className="block w-full cursor-pointer rounded-xl border border-dashed border-border bg-slate-50 p-3 text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
          />
          {uploading && <p className="mt-1 text-xs text-muted">جارٍ رفع الصورة…</p>}
          {form.image ? (
            <a href={getPublicUrl(String(form.image)) ?? '#'} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              <Eye className="size-3.5" /> معاينة الصورة الحالية
            </a>
          ) : null}
        </Field>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => set('is_active', e.target.checked)} className="size-4 accent-primary" />
          مفعّل (يظهر للزوار)
        </label>
        <div className="flex gap-3">
          <Button type="submit" loading={saving} className="flex-1">{isEdit ? 'حفظ' : 'إضافة'}</Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Dialog>
  )
}