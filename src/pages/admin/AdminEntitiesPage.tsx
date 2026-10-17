import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, Pencil, Trash2, ExternalLink, Eye, EyeOff, Upload, X, Star, Gift, Copy, Check, MessageCircle, KeyRound, Sparkles,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { compressImage, deleteImage, updateEntity, startDoctorTrial, ensureEntityAccount, type TrialResult, type UpdateRequestResult } from '@/services/admin'
import { uploadImage } from '@/services/admin'
import { Input, Select, Textarea, Field } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog'
import { Skeletons, EmptyState } from '@/components/ui/States'
import { Pagination } from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { cn, slugify, planExpiryFromNow } from '@/lib/utils'
import { enumValues, type EntityMeta, ENTITY_META } from '@/features/admin/entityMeta'
import type { EntityType } from '@/types'

export function AdminEntitiesPage({ table }: { table: string }) {
  const meta = useMemo(() => ENTITY_META[table] ?? ENTITY_META[Object.keys(ENTITY_META)[0]] as EntityMeta, [table])
  const dataType = meta.type as 'doctor' | 'clinic' | 'hospital' | 'health_center' | 'pharmacy' | 'lab' | 'radiology'

  return <AdminEntityContent key={table} table={table} meta={meta} dataType={dataType} />
}

function AdminEntityContent({ table, meta, dataType }: { table: string; meta: EntityMeta; dataType: string }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null)
  const [trial, setTrial] = useState<{ row: Record<string, unknown>; result?: TrialResult } | null>(null)
  const [creds, setCreds] = useState<{ row: Record<string, unknown>; result?: UpdateRequestResult } | null>(null)
  const qc = useQueryClient()
  const toast = useToast()
  const PAGE_SIZE = 10

  const { data, isLoading } = useQuery({
    queryKey: ['admin-entities', table, search, page],
    queryFn: async () => {
      let q = supabase.from(table).select('*', { count: 'exact' })
      if (search) q = q.ilike('name', `%${search}%`)
      q = q.order('sort_order').order('created_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      const { data, count } = await q
      return { data: (data ?? []) as Array<Record<string, unknown>>, count: count ?? 0 }
    },
  })

  const deleteMut = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const images = (row.images as string[] | null) ?? []
      const gallery = (row.gallery as string[] | null) ?? []
      await Promise.all([...images, ...gallery, row.image as string | null].filter(Boolean).map((p) => deleteImage(p as string)))
      const { error } = await supabase.from(table).delete().eq('id', String(row.id))
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-entities', table] })
      void qc.invalidateQueries({ queryKey: ['entities'] })
      toast.show('تم الحذف بنجاح')
      setDeleting(null)
    },
    onError: () => toast.show('تعذر الحذف', 'error'),
  })

  const trialMut = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: 'pro' | 'gold' }) => {
      const res = await startDoctorTrial(id, plan)
      if (!res || res.error || !res.ok) throw new Error(res?.error ?? 'تعذر تفعيل التجربة')
      return res
    },
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['admin-entities', table] })
      void qc.invalidateQueries({ queryKey: ['entities'] })
      toast.show('تم تفعيل/تمديد التجربة شهراً كاملاً')
      setTrial({ row: trial!.row, result: res })
    },
    onError: (e: Error) => toast.show(e.message || 'تعذر تفعيل التجربة', 'error'),
  })

  const credMut = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const res = await ensureEntityAccount(dataType as EntityType, String(row.id))
      if (res.accountError) throw new Error(res.accountError)
      return res
    },
    onSuccess: (res) => {
      toast.show('تم توليد بيانات دخول جديدة')
      setCreds((prev) => prev ? { row: { ...prev.row, __creds: res }, result: res } : null)
    },
    onError: (e: Error) => toast.show(e.message || 'تعذر توليد البيانات', 'error'),
  })

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">إدارة {meta.label}</h1>
          <p className="mt-0.5 text-sm text-muted">{data?.count ?? '…'} سجل في الدليل</p>
        </div>
        <Button size="md" onClick={() => setEditing({})}>
          <Plus className="size-4.5" />
          إضافة جديد
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="بحث بالاسم…"
          className="pr-11"
        />
      </div>

      {isLoading ? (
        <Skeletons rows={6} />
      ) : !data?.data.length ? (
        <EmptyState title="لا توجد سجلات" description={search ? 'جرّب كلمة بحث أخرى.' : 'ابدأ بإضافة أول سجل في الدليل.'} />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-right text-sm">
                <thead>
                  <tr className="border-b border-border bg-subtle text-xs font-black text-muted">
                    <th className="px-5 py-3.5">الاسم</th>
                    <th className="px-5 py-3.5">الاختصاص</th>
                    <th className="px-5 py-3.5">الهاتف</th>
                    <th className="px-5 py-3.5">الحالة</th>
                    <th className="px-5 py-3.5">الباقة</th>
                    <th className="px-5 py-3.5 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.data.map((row) => (
                    <tr key={String(row.id)} className="transition-colors hover:bg-subtle/70">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {row.image ? (
                            <img src={supabase.storage.from('medical').getPublicUrl(String(row.image)).data.publicUrl} alt="" className="size-10 rounded-xl object-cover" />
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary-light text-primary-dark text-xs font-black">
                              {String(row.name ?? '؟').slice(0, 1)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-ink">{String(row.name ?? '')}</p>
                            <Link to={`/${meta.publicRoute}/${row.slug ?? row.id}`} target="_blank" className="flex items-center gap-1 text-[11px] text-muted hover:text-primary">
                              عرض الصفحة <ExternalLink className="size-3" />
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted">{String(row.specialty ?? '—')}</td>
                      <td className="px-5 py-3.5 text-muted" dir="ltr">{String(row.phone ?? '—')}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold', row.is_active ? 'bg-emerald-50 text-success' : 'bg-subtle-strong text-muted')}>
                          {row.is_active ? 'مفعّل' : 'مخفّي'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <PlanToggle table={table} row={row} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {table === 'doctors' && (
                            <button
                              onClick={() => setTrial({ row })}
                              title="تفعيل/تمديد تجربة شهر كامل + بيانات دخول جديدة للوحة"
                              className="flex size-9 items-center justify-center rounded-xl border border-gold/40 bg-gold-soft text-gold-dark transition hover:border-gold hover:bg-gold hover:text-primary-dark cursor-pointer"
                            >
                              <Gift className="size-4" />
                            </button>
                          )}
                          {table === 'doctors' && String(row.plan ?? 'free') !== 'free' && Boolean(row.plan_expires_at && new Date(String(row.plan_expires_at)) > new Date()) && (
                            <button
                              onClick={() => setCreds({ row })}
                              title="توليد بيانات دخول لوحة الطبيب وإرسالها"
                              className="flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary-light text-primary-dark transition hover:border-primary hover:bg-primary hover:text-white cursor-pointer"
                            >
                              <KeyRound className="size-4" />
                            </button>
                          )}
                          {(table === 'doctors' || table === 'pharmacies') && (
                            <button
                              onClick={() => void (async () => {
                                const ok = await toggleFeatured(table, String(row.id), Boolean(row.is_featured))
                                if (ok) {
                                  await qc.invalidateQueries({ queryKey: ['admin-entities', table] })
                                  await qc.invalidateQueries({ queryKey: ['entities'] })
                                  await qc.invalidateQueries({ queryKey: ['featured-doctors'] })
                                  await qc.invalidateQueries({ queryKey: ['featured-pharmacies'] })
                                  toast.show(row.is_featured ? 'أُزيل من المميّزين' : 'أُضيف إلى المميّزين')
                                } else {
                                  toast.show('تعذر تحديث الحالة', 'error')
                                }
                              })()}
                              title={row.is_featured ? 'إزالة من المميزين' : 'إضافة إلى المميزين'}
                              className={`flex size-9 items-center justify-center rounded-xl border transition cursor-pointer ${row.is_featured ? 'border-gold bg-gold-soft text-gold-dark' : 'border-border text-muted hover:border-gold hover:text-gold-dark'}`}
                            >
                              <Star className={`size-4 ${row.is_featured ? 'fill-gold' : ''}`} />
                            </button>
                          )}
                          <button
                            onClick={() => setEditing({ ...row })}
                            title="تعديل"
                            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted transition hover:border-primary hover:text-primary cursor-pointer"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeleting(row)}
                            title="حذف"
                            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted transition hover:border-error hover:text-error cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {editing !== null && (
        <EntityForm
          table={table}
          meta={meta}
          dataType={dataType}
          values={editing}
          onClose={() => setEditing(null)}
          onDone={() => {
            setEditing(null)
            void qc.invalidateQueries({ queryKey: ['admin-entities', table] })
            void qc.invalidateQueries({ queryKey: ['entities'] })
          }}
        />
      )}

      {trial !== null && (
        <Dialog open onClose={() => setTrial(null)} title="تجربة شهر مجاني — كاملة المزايا" size="md">
          {trial.result ? (
            <TrialCredsView
              result={trial.result}
              phone={String(trial.row.phone ?? '')}
              onDone={() => setTrial(null)}
            />
          ) : (
            <TrialConfirmForm
              name={String(trial.row.name ?? '')}
              loading={trialMut.isPending}
              onConfirm={(plan) => trialMut.mutate({ id: String(trial.row.id), plan })}
            />
          )}
        </Dialog>
      )}

      {creds !== null && (
        <Dialog open onClose={() => setCreds(null)} title="بيانات دخول لوحة الطبيب" size="md">
          <EntityCredsView
            row={creds.row}
            loading={credMut.isPending}
            hasResult={Boolean(creds.result && !creds.result.accountError)}
            onGenerate={() => credMut.mutate(creds.row)}
            onDone={() => setCreds(null)}
          />
        </Dialog>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMut.mutate(deleting)}
        title="حذف السجل"
        message={`هل أنت متأكد من حذف «${String(deleting?.name ?? '')}»؟ لا يمكن التراجع عن هذا الإجراء.`}
        loading={deleteMut.isPending}
      />
    </div>
  )
}

async function toggleFeatured(table: string, id: string, current: boolean): Promise<boolean> {
  const { error } = await supabase.from(table).update({ is_featured: !current }).eq('id', id)
  return !error
}

function PlanToggle({ table, row }: { table: string; row: Record<string, unknown> }) {
  const qc = useQueryClient()
  const current = String(row.plan ?? 'free')
  return (
    <select
      value={current}
      onChange={async (e) => {
        const plan = e.target.value
        // تفعيل الباقة لمدة شهر من الآن، والرجوع للمجانية يلغي تاريخ الانتهاء
        await updateEntity(table as EntityType, String(row.id), {
          plan,
          plan_expires_at: plan === 'free' ? null : planExpiryFromNow(),
        })
        void qc.invalidateQueries({ queryKey: ['admin-entities', table] })
      }}
      className={cn(
        'cursor-pointer rounded-full border px-2.5 py-1 text-[11px] font-bold outline-none',
        current === 'free' && 'border-border bg-subtle text-muted',
        current === 'pro' && 'border-primary/30 bg-primary-light text-primary-dark',
        current === 'gold' && 'border-gold bg-gold-soft text-gold-dark',
      )}
    >
      <option value="free">مجاني</option>
      <option value="pro">احترافي</option>
      <option value="gold">ذهبي</option>
    </select>
  )
}

function EntityForm({ table, meta, dataType, values, onClose, onDone }: {
  table: string
  meta: EntityMeta
  dataType: string
  values: Record<string, unknown>
  onClose: () => void
  onDone: () => void
}) {
  const [form, setForm] = useState<Record<string, unknown>>(() => ({ ...values }))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  const qc = useQueryClient()
  const isEdit = Boolean(values.id)

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const linesOf = (v: unknown): string[] => String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!String(form.name ?? '').trim()) {
      setError('الاسم مطلوب')
      return
    }
    setSaving(true)
    const payload: Record<string, unknown> = {
      name: String(form.name ?? '').trim(),
      slug: String(form.slug ?? '').trim() || slugify(String(form.name ?? '')),
      description: String(form.description ?? '').trim() || null,
      phone: String(form.phone ?? '').trim() || null,
      whatsapp: String(form.whatsapp ?? '').trim() || null,
      facebook: String(form.facebook ?? '').trim() || null,
      instagram: String(form.instagram ?? '').trim() || null,
      address: String(form.address ?? '').trim() || null,
      lat: form.lat ? Number(form.lat) : null,
      lng: form.lng ? Number(form.lng) : null,
      is_verified: Boolean(form.is_verified),
      is_active: Boolean(form.is_active),
      is_featured: dataType === 'doctor' || dataType === 'pharmacy' ? Boolean(form.is_featured) : undefined,
      is_featured_placeholder: undefined,
      is_active_placeholder: undefined,
      image: form.image ? String(form.image) : null,
      plan: String(form.plan ?? 'free'),
      updated_at: new Date().toISOString(),
    }
    delete payload.is_active_placeholder
    delete payload.is_featured_placeholder

    const compact = (m: string) => { if (form[m] !== undefined) payload[m] = linesOf(form[m]) }
    const single = (m: string) => { if (form[m] !== undefined) payload[m] = String(form[m] ?? '').trim() || null }
    // قوائم الصور تُخزَّن كمصفوفة مسارات مباشرة (وليس نصاً مفصولاً بأسطر)
    const arrays = (m: string) => {
      if (form[m] !== undefined) {
        const v = form[m]
        payload[m] = Array.isArray(v) ? v.filter(Boolean) : linesOf(v)
      }
    }

    arrays('images')
    arrays('gallery')

    if (dataType === 'doctor') {
      set('specialty', form.specialty ?? '')
      payload.specialty = String(form.specialty ?? '') || null
      payload.gender = String(form.gender ?? '') || null
      payload.experience_years = form.experience_years ? Number(form.experience_years) : null
      payload.bio = String(form.bio ?? '').trim() || null
      compact('certifications')
      compact('services')
      single('video_url')
    } else if (dataType === 'clinic' || dataType === 'hospital' || dataType === 'health_center') {
      payload.specialty = String(form.specialty ?? '') || null
      compact('services')
      compact('departments')
      if (dataType === 'hospital') single('emergency_phone')
    } else if (dataType === 'pharmacy') {
      compact('services')
      single('opening_hours')
    } else if (dataType === 'lab') {
      compact('services')
      compact('tests')
      single('opening_hours')
    } else if (dataType === 'radiology') {
      compact('services')
      compact('machines')
      single('opening_hours')
    }

    const workHours = getWorkHours(form)
    if (workHours) payload.work_hours = workHours

    // تفعيل مدة الباقة: عند تغيير الباقة تُحدد لمدة شهر من الآن، والرجوع للمجانية يلغي تاريخ الانتهاء
    const prevPlan = String(values.plan ?? 'free')
    const nextPlan = String(form.plan ?? 'free')
    if (nextPlan !== prevPlan) {
      payload.plan_expires_at = nextPlan === 'free' ? null : planExpiryFromNow()
    }

    let result
    if (isEdit) {
      result = await supabase.from(table).update(payload).eq('id', String(values.id)).select().single()
    } else {
      payload.created_at = new Date().toISOString()
      payload.sort_order = Math.floor(Date.now() / 1000)
      result = await supabase.from(table).insert(payload).select().single()
    }
    setSaving(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    await qc.invalidateQueries({ queryKey: ['entities'] })
    toast.show(isEdit ? 'تم حفظ التعديلات' : 'تمت الإضافة بنجاح')
    onDone()
  }

  const upload = async (files: FileList | null, target: 'image' | 'images' | 'gallery') => {
    if (!files?.length) return
    setSaving(true)
    try {
      const type = meta.type as Parameters<typeof uploadImage>[0]
      for (const f of Array.from(files)) {
        const compressed = await compressImage(f)
        const path = await uploadImage(type, compressed)
        if (target === 'image') set('image', path)
        else if (target === 'images') set('images', [...(form.images as string[] ?? []), path])
        else set('gallery', [...(form.gallery as string[] ?? []), path])
      }
      toast.show('تم رفع الصورة')
    } catch {
      toast.show('تعذر رفع الصورة', 'error')
    } finally {
      setSaving(false)
    }
  }

  const removeImage = (target: 'image' | 'images' | 'gallery', path?: string) => {
    if (target === 'image') {
      void deleteImage(form.image as string)
      set('image', null)
    } else {
      const list = (form[target] as string[] ?? []).filter((p) => p !== path)
      set(target, list)
      void deleteImage(path)
    }
  }

  const imgUrl = (p?: string | null): string | undefined =>
    p && !p.startsWith('http') ? supabase.storage.from('medical').getPublicUrl(p).data.publicUrl : (p ?? undefined)

  return (
    <Dialog open onClose={onClose} title={isEdit ? `تعديل: ${String(values.name ?? '')}` : `إضافة ${meta.label}`} size="xl">
      <form onSubmit={submit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="الاسم" required>
            <Input value={String(form.name ?? '')} onChange={(e) => set('name', e.target.value)} required />
          </Field>
          {(dataType === 'doctor' || dataType === 'clinic') && (
            <Field label="الاختصاص" hint="اختر من القائمة المنسدلة أو اكتب اختصاصاً جديداً غير موجود">
              <Input
                list="specialty-suggestions"
                value={String(form.specialty ?? '')}
                onChange={(e) => set('specialty', e.target.value)}
                placeholder="مثال: قلبية، عظام، جهاز هضمي…"
              />
              <datalist id="specialty-suggestions">
                {enumValues.specialties.map((s) => <option key={s} value={s} />)}
              </datalist>
            </Field>
          )}
          <Field label="رقم الهاتف">
            <Input value={String(form.phone ?? '')} onChange={(e) => set('phone', e.target.value)} placeholder="09xx xxx xxx" dir="ltr" />
          </Field>
          <Field label="واتساب">
            <Input value={String(form.whatsapp ?? '')} onChange={(e) => set('whatsapp', e.target.value)} placeholder="09xx xxx xxx" dir="ltr" />
          </Field>
          <Field label="فيسبوك (رابط)">
            <Input value={String(form.facebook ?? '')} onChange={(e) => set('facebook', e.target.value)} placeholder="https://facebook.com/..." dir="ltr" />
          </Field>
          <Field label="انستغرام (رابط)">
            <Input value={String(form.instagram ?? '')} onChange={(e) => set('instagram', e.target.value)} placeholder="https://instagram.com/..." dir="ltr" />
          </Field>
          {dataType === 'hospital' && (
            <Field label="رقم الطوارئ">
              <Input value={String(form.emergency_phone ?? '')} onChange={(e) => set('emergency_phone', e.target.value)} dir="ltr" />
            </Field>
          )}
          <Field label="العنوان">
            <Input value={String(form.address ?? '')} onChange={(e) => set('address', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="خط العرض (Lat)">
              <Input type="number" step="any" value={String(form.lat ?? '')} onChange={(e) => set('lat', e.target.value)} dir="ltr" />
            </Field>
            <Field label="خط الطول (Lng)">
              <Input type="number" step="any" value={String(form.lng ?? '')} onChange={(e) => set('lng', e.target.value)} dir="ltr" />
            </Field>
          </div>
          {dataType === 'doctor' && (
            <>
              <Field label="سنوات الخبرة">
                <Input type="number" value={String(form.experience_years ?? '')} onChange={(e) => set('experience_years', e.target.value)} />
              </Field>
              <Field label="الجنس">
                <Select value={String(form.gender ?? '')} onChange={(e) => set('gender', e.target.value)}>
                  <option value="">— بدون —</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </Select>
              </Field>
            </>
          )}
          <Field label="الباقة">
            <Select value={String(form.plan ?? 'free')} onChange={(e) => set('plan', e.target.value)}>
              <option value="free">مجانية</option>
              <option value="pro">احترافية</option>
              <option value="gold">ذهبية</option>
            </Select>
          </Field>
        </div>

        <Field label="الوصف / النبذة">
          <Textarea rows={4} value={String(form.description ?? form.bio ?? '')} onChange={(e) => { set('description', e.target.value); set('bio', e.target.value) }} />
        </Field>

        {dataType === 'doctor' && (
          <Field label="الشهادات (كل شهادة في سطر)">
            <Textarea rows={3} value={String(form.certifications ?? '').split('|').join('\n')} onChange={(e) => set('certifications', e.target.value)} />
          </Field>
        )}

        {(dataType === 'clinic' || dataType === 'hospital' || dataType === 'health_center' || dataType === 'lab' || dataType === 'radiology' || dataType === 'pharmacy') && (
          <Field label={dataType === 'hospital' || dataType === 'health_center' ? 'الأقسام (كل قسم في سطر)' : dataType === 'pharmacy' ? 'الخدمات (كل خدمة في سطر)' : 'الخدمات (كل خدمة في سطر)'}>
            <Textarea rows={3} value={String(form.departments ?? form.services ?? '').split('|').join('\n')} onChange={(e) => {
              set('departments', e.target.value)
              set('services', e.target.value)
            }} />
          </Field>
        )}

        {dataType === 'lab' && (
          <Field label="التحاليل (كل تحليل في سطر)">
            <Textarea rows={3} value={String(form.tests ?? '')} onChange={(e) => set('tests', e.target.value)} />
          </Field>
        )}
        {dataType === 'radiology' && (
          <Field label="الأجهزة (كل جهاز في سطر)">
            <Textarea rows={3} value={String(form.machines ?? '')} onChange={(e) => set('machines', e.target.value)} />
          </Field>
        )}

        <Field label="ساعات الدوام">
          <WorkHoursEditor value={form.work_hours as Record<string, string> | undefined} onChange={(wh) => set('work_hours', wh)} />
        </Field>

        {dataType === 'doctor' && (
          <Field label="رابط الفيديو التعريفي (YouTube)">
            <Input value={String(form.video_url ?? '')} onChange={(e) => set('video_url', e.target.value)} dir="ltr" placeholder="https://www.youtube.com/embed/…" />
          </Field>
        )}

        <ImageUploader label="الصورة الرئيسية" paths={form.image ? [form.image as string] : []} onUpload={(f) => void upload(f, 'image')} onRemove={() => removeImage('image')} imgUrl={imgUrl} />

        <ImageUploader
          label="معرض الصور الإضافي"
          paths={(form.images as string[] ?? []).concat(form.gallery as string[] ?? [])}
          onUpload={(f) => void upload(f, dataType === 'doctor' ? 'gallery' : 'images')}
          onRemove={(p) => removeImage(dataType === 'doctor' ? 'gallery' : 'images', p)}
          imgUrl={imgUrl}
          multiple
        />

        <div className="grid grid-cols-3 gap-3">
          <label className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition', form.is_verified ? 'border-primary bg-primary-light/50 text-primary-dark' : 'border-border text-muted hover:border-primary/40')}>
            <input type="checkbox" className="hidden" checked={Boolean(form.is_verified)} onChange={(e) => set('is_verified', e.target.checked)} />
            {form.is_verified ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            موثّق
          </label>
          <label className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition', form.is_active ? 'border-primary bg-primary-light/50 text-primary-dark' : 'border-border text-muted hover:border-primary/40')}>
            <input type="checkbox" className="hidden" checked={Boolean(form.is_active)} onChange={(e) => set('is_active', e.target.checked)} />
            {form.is_active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            مفعّل
          </label>
          {(dataType === 'doctor' || dataType === 'pharmacy') && (
            <label className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition', form.is_featured ? 'border-gold bg-gold-soft text-gold-dark' : 'border-border text-muted hover:border-gold/60')}>
              <input type="checkbox" className="hidden" checked={Boolean(form.is_featured)} onChange={(e) => set('is_featured', e.target.checked)} />
              <Star className={`size-4 ${form.is_featured ? 'fill-gold' : ''}`} />
              مميّز
            </label>
          )}
          <div className="rounded-xl bg-subtle px-3 py-3 text-center text-xs font-bold text-muted">
            عدد الزيارات: {String(form.view_count ?? 0)}
          </div>
        </div>

        {error && <p className="rounded-xl bg-wine-soft px-3 py-2.5 text-xs font-semibold text-error">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saving} className="flex-1">
            {isEdit ? 'حفظ التعديلات' : 'إضافة'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Dialog>
  )
}

function ImageUploader({ label, paths, onUpload, onRemove, imgUrl, multiple }: {
  label: string
  paths: string[]
  onUpload: (f: FileList | null) => void
  onRemove: (p: string) => void
  imgUrl: (p?: string | null) => string | undefined
  multiple?: boolean
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink">{label}</p>
      <div className="flex flex-wrap gap-3">
        {paths.filter(Boolean).map((p) => (
          <div key={p} className="relative">
            <img src={imgUrl(p)} alt="" className="size-24 rounded-xl border border-border object-cover" />
            <button type="button" onClick={() => onRemove(p)} className="absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-full bg-error text-white shadow cursor-pointer">
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted transition hover:border-primary hover:text-primary">
          <Upload className="size-6" />
          <span className="text-[10px] font-bold">رفع صورة</span>
          <input type="file" accept="image/*" multiple={multiple} className="hidden" onChange={(e) => onUpload(e.target.files)} />
        </label>
      </div>
    </div>
  )
}

function getWorkHours(form: Record<string, unknown>): Record<string, string> | null {
  const wh = form.work_hours as Record<string, string> | undefined | null
  if (wh && Object.keys(wh).length) {
    const cleaned: Record<string, string> = {}
    for (const [k, v] of Object.entries(wh)) {
      if (String(v ?? '').trim()) cleaned[k] = String(v).trim()
    }
    return Object.keys(cleaned).length ? cleaned : null
  }
  return null
}

function WorkHoursEditor({ value, onChange }: { value?: Record<string, string> | null; onChange: (v: Record<string, string>) => void }) {
  const days = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri']
  const names: Record<string, string> = { sat: 'السبت', sun: 'الأحد', mon: 'الاثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة' }
  const current = value ?? {}
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {days.map((d) => (
        <div key={d} className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-xs font-bold text-muted">{names[d]}</span>
          <Input value={current[d] ?? ''} placeholder="9:00 - 17:00 أو مغلق" onChange={(e) => onChange({ ...current, [d]: e.target.value })} />
        </div>
      ))}
    </div>
  )
}
function TrialConfirmForm({ name, loading, onConfirm }: { name: string; loading: boolean; onConfirm: (plan: 'pro' | 'gold') => void }) {
  const [plan, setPlan] = useState<'pro' | 'gold'>('pro')
  return (
    <div className="space-y-4">
      <p className="rounded-xl bg-gold-soft px-4 py-3 text-xs leading-6 text-gold-dark">
        ستُفعَّل للطبيب <strong className="text-ink">{name}</strong> باقة كاملة لمدة <strong className="text-ink">شهر واحد</strong> تُحتسب من الآن: طلبات المواعيد وشارة الباقة وتحديث الملف — <strong className="text-ink">دون شارة «مميّز» في الواجهة الرئيسية</strong>. إن كانت له تجربة سابقة فستُمدَّد شهراً جديداً من الآن، وتُنشأ بيانات دخول لوحته فوراً لتسليمها له.
      </p>
      <Field label="الباقة التجريبية">
        <Select value={plan} onChange={(e) => setPlan(e.target.value as 'pro' | 'gold')}>
          <option value="pro">احترافية</option>
          <option value="gold">ذهبية</option>
        </Select>
      </Field>
      <Button loading={loading} className="flex-1" onClick={() => onConfirm(plan)}>
        <Gift className="size-4" />
        تفعيل التجربة وإنشاء الحساب
      </Button>
    </div>
  )
}

function TrialCredsView({ result, phone, onDone }: { result: TrialResult; phone: string; onDone: () => void }) {
  const toast = useToast()
  const [copied, setCopied] = useState<string | null>(null)
  const magic = result.magic_token ? `${window.location.origin}/account/${result.slug}?tk=${encodeURIComponent(result.magic_token)}` : ''
  const message = `مرحباً ${result.name ?? ''}، تم تفعيل تجربة شهر مجاني كامل في دليل طيبة الإمام الطبي:\nرابط لوحة تحكمك: ${magic}\nالبريد: ${result.email ?? ''}\nكلمة السر: ${result.password ?? ''}\nتشمل: طلبات المواعيد وإدارة ملفك الكامل. بالتوفيق!`
  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1200)
    } catch {
      toast.show('تعذر النسخ', 'error')
    }
  }
  const wa = phone ? `https://wa.me/963${phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(message)}` : ''
  const row = (label: string, value: string, key: string) => (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-subtle px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-ink" dir="ltr">{value}</p>
      </div>
      <button onClick={() => void copy(value, key)} className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:text-primary cursor-pointer" aria-label={`نسخ ${label}`}>
        {copied === key ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      </button>
    </div>
  )
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-success">
        <Sparkles className="size-4" />
        تم تفعيل/تمديد تجربة شهر كامل لـ«{result.name}»{result.times_activated && result.times_activated > 1 ? ` (التفعيل رقم ${result.times_activated})` : ''} مع بيانات دخول جديدة للوحة.
      </p>
      <div className="space-y-3">
        {row('رابط الدخول المباشر للوحة', magic, 'link')}
        {row('البريد الإلكتروني', result.email ?? '', 'email')}
        {row('كلمة السر', result.password ?? '', 'pass')}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {wa && (
          <Button variant="whatsapp" asChild>
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" /> إرسال عبر واتساب
            </a>
          </Button>
        )}
        <Button variant="secondary" onClick={() => void copy(message, 'all')}>
          {copied === 'all' ? <Check className="size-4" /> : <Copy className="size-4" />}
          نسخ البيانات معاً
        </Button>
      </div>
      <p className="flex items-start gap-1.5 text-[11px] leading-5 text-muted">
        <KeyRound className="mt-0.5 size-3.5 shrink-0 text-primary" />
        تنتهي التجربة تلقائياً بعد شهر — ويمكنك إعادة تفعيلها من زر الهدية 🎁 في أي وقت، أو توليد بيانات دخول جديدة من زر «بيانات الدخول» دون تمديد.
      </p>
      <Button variant="outline" className="w-full" onClick={onDone}>إغلاق</Button>
    </div>
  )
}

/** توليد/إعادة إرسال بيانات دخول لوحة طبيب لديه حساب فعّال (تجربة أو اشتراك) */
function EntityCredsView({ row, loading, hasResult, onGenerate, onDone }: {
  row: Record<string, unknown>
  loading: boolean
  hasResult: boolean
  onGenerate: () => void
  onDone: () => void
}) {
  const [copied, setCopied] = useState<string | null>(null)
  const toast = useToast()
  const result = hasResult ? row.__creds as UpdateRequestResult | undefined : undefined
  const phone = String(row.phone ?? '')
  const magic = result?.linkToken && result?.slug
    ? `${window.location.origin}/account/${result.slug}?tk=${encodeURIComponent(result.linkToken)}`
    : ''
  const message = `مرحباً ${result?.name ?? String(row.name ?? '')}، بيانات دخول لوحة تحكمك في دليل طيبة الإمام الطبي:\nرابط الدخول المباشر: ${magic}\nالبريد: ${result?.email ?? ''}\nكلمة السر: ${result?.password ?? ''}\nيمكنك من اللوحة إدارة ملفك وساعات دوامك وطلبات المواعيد. بالتوفيق!`
  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1200)
    } catch {
      toast.show('تعذر النسخ', 'error')
    }
  }
  const wa = phone ? `https://wa.me/963${phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(message)}` : ''

  if (!result) {
    return (
      <div className="space-y-4">
        <p className="rounded-xl bg-subtle px-4 py-3 text-xs leading-6 text-muted">
          سيتم توليد <strong className="text-ink">كلمة سر ورابط دخول سحري جديدين</strong> للطبيب <strong className="text-ink">{String(row.name ?? '')}</strong> — البيانات القديمة لم تعد بحوزتك (كلمة السر مخزنة مشفرة) وهذا التوليد يعطيك نسخة جديدة كاملة لتسليمها له. الدخول السابق بكلمة السر القديمة سيتوقف.
        </p>
        <Button loading={loading} className="w-full" onClick={onGenerate}>
          <KeyRound className="size-4" />
          توليد بيانات دخول جديدة
        </Button>
      </div>
    )
  }

  const credRow = (label: string, value: string, key: string) => (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-subtle px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-bold text-ink" dir="ltr">{value}</p>
      </div>
      <button onClick={() => void copy(value, key)} className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:text-primary cursor-pointer" aria-label={`نسخ ${label}`}>
        {copied === key ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      </button>
    </div>
  )

  return (
    <div className="space-y-4">
      <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-success">
        <KeyRound className="size-4" />
        بيانات دخول جديدة لـ«{result.name ?? String(row.name ?? '')}» — جاهزة للإرسال.
      </p>
      <div className="space-y-3">
        {credRow('رابط الدخول المباشر للوحة', magic, 'link')}
        {credRow('البريد الإلكتروني', result.email ?? '', 'email')}
        {credRow('كلمة السر', result.password ?? '', 'pass')}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {wa && (
          <Button variant="whatsapp" asChild>
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" /> إرسال عبر واتساب
            </a>
          </Button>
        )}
        <Button variant="secondary" onClick={() => void copy(message, 'all')}>
          {copied === 'all' ? <Check className="size-4" /> : <Copy className="size-4" />}
          نسخ البيانات معاً
        </Button>
      </div>
      <Button variant="outline" className="w-full" onClick={onDone}>إغلاق</Button>
    </div>
  )
}
