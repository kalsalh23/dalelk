import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Pencil, Trash2, Upload, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { compressImage, deleteImage, uploadImage } from '@/services/admin'
import { Input, Select, Textarea, Field } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog'
import { Skeletons, EmptyState } from '@/components/ui/States'
import { Pagination } from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { cn, slugify } from '@/lib/utils'
import { getPublicUrl } from '@/lib/supabase'

export function AdminArticlesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null)
  const qc = useQueryClient()
  const toast = useToast()
  const PAGE_SIZE = 10

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', search, page],
    queryFn: async () => {
      let q = supabase.from('articles').select('*', { count: 'exact' })
      if (search) q = q.ilike('title', `%${search}%`)
      q = q.order('published_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      const { data, count } = await q
      return { data: (data ?? []) as Array<Record<string, unknown>>, count: count ?? 0 }
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['admin-article-cats'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').eq('type', 'article').order('sort_order')
      return (data ?? []) as Array<{ id: string; name: string }>
    },
  })

  const del = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      await deleteImage(row.image as string)
      const { error } = await supabase.from('articles').delete().eq('id', String(row.id))
      if (error) throw error
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-articles'] }); toast.show('تم حذف المقال'); setDeleting(null) },
    onError: () => toast.show('تعذر الحذف', 'error'),
  })

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">النصائح الطبية</h1>
          <p className="mt-0.5 text-sm text-muted">{data?.count ?? '…'} مقال</p>
        </div>
        <Button onClick={() => setEditing({})}><Plus className="size-4.5" /> مقال جديد</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted" />
        <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="بحث بالعنوان…" className="pr-11" />
      </div>

      {isLoading ? (
        <Skeletons rows={5} box="!p-5" />
      ) : !data?.data.length ? (
        <EmptyState title="لا توجد مقالات" />
      ) : (
        <>
          <div className="space-y-2">
            {data.data.map((a) => (
              <Card key={String(a.id)} className="flex items-center gap-4 p-4">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-primary-light/40">
                  {a.image ? <img src={getPublicUrl(a.image as string) ?? ''} alt="" className="h-full w-full object-cover" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{String(a.title)}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', a.is_published ? 'bg-emerald-50 text-success' : 'bg-slate-100 text-muted')}>
                      {a.is_published ? 'منشور' : 'مسودة'}
                    </span>
                    <span>{categories?.find((c) => c.id === a.category_id)?.name ?? 'عام'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setEditing({ ...a })} className="flex size-9 items-center justify-center rounded-xl border border-border text-muted hover:border-primary hover:text-primary cursor-pointer"><Pencil className="size-4" /></button>
                  <button onClick={() => setDeleting(a)} className="flex size-9 items-center justify-center rounded-xl border border-border text-muted hover:border-error hover:text-error cursor-pointer"><Trash2 className="size-4" /></button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {editing !== null && (
        <ArticleForm
          values={editing}
          categories={categories ?? []}
          onClose={() => setEditing(null)}
          onDone={() => { setEditing(null); void qc.invalidateQueries({ queryKey: ['admin-articles'] }) }}
        />
      )}
      <ConfirmDialog open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={() => deleting && del.mutate(deleting)} title="حذف المقال" message={`حذف «${String(deleting?.title ?? '')}» نهائياً؟`} loading={del.isPending} />
    </div>
  )
}

function ArticleForm({ values, categories, onClose, onDone }: {
  values: Record<string, unknown>
  categories: Array<{ id: string; name: string }>
  onClose: () => void
  onDone: () => void
}) {
  const [form, setForm] = useState<Record<string, unknown>>({ ...values })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  const isEdit = Boolean(values.id)
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!String(form.title ?? '').trim()) { setError('العنوان مطلوب'); return }
    setSaving(true)
    const payload = {
      title: String(form.title ?? '').trim(),
      slug: String(form.slug ?? '').trim() || slugify(String(form.title ?? '')),
      excerpt: String(form.excerpt ?? '').trim() || null,
      content: String(form.content ?? ''),
      category_id: String(form.category_id ?? '') || null,
      image: (form.image as string) ?? null,
      is_published: Boolean(form.is_published),
      is_featured: Boolean(form.is_featured),
      seo_title: String(form.seo_title ?? '').trim() || null,
      seo_description: String(form.seo_description ?? '').trim() || null,
      published_at: form.published_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const result = isEdit
      ? await supabase.from('articles').update(payload).eq('id', String(values.id)).select().single()
      : await supabase.from('articles').insert(payload).select().single()
    setSaving(false)
    if (result.error) { setError(result.error.message); return }
    toast.show(isEdit ? 'تم حفظ التعديلات' : 'تم نشر المقال')
    onDone()
  }

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setSaving(true)
    try {
      const compressed = await compressImage(files[0])
      const path = await uploadImage('clinic', compressed)
      set('image', path)
      toast.show('تم رفع الصورة')
    } catch { toast.show('تعذر رفع الصورة', 'error') } finally { setSaving(false) }
  }

  return (
    <Dialog open onClose={onClose} title={isEdit ? 'تعديل المقال' : 'مقال جديد'} size="xl">
      <form onSubmit={submit} className="space-y-5">
        <Field label="العنوان" required>
          <Input value={String(form.title ?? '')} onChange={(e) => set('title', e.target.value)} required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="التصنيف">
            <Select value={String(form.category_id ?? '')} onChange={(e) => set('category_id', e.target.value)}>
              <option value="">عام</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="الرابط المختصر (Slug)">
            <Input value={String(form.slug ?? '')} onChange={(e) => set('slug', e.target.value)} placeholder="يُولّد تلقائياً" dir="ltr" />
          </Field>
        </div>
        <Field label="الملخص (Excerpt)">
          <Textarea rows={2} value={String(form.excerpt ?? '')} onChange={(e) => set('excerpt', e.target.value)} />
        </Field>
        <Field label="محتوى المقال (يدعم HTML)">
          <Textarea rows={10} value={String(form.content ?? '')} onChange={(e) => set('content', e.target.value)} placeholder="<h2>العنوان</h2><p>نص الفقرة…</p>" dir="auto" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SEO Title">
            <Input value={String(form.seo_title ?? '')} onChange={(e) => set('seo_title', e.target.value)} />
          </Field>
          <Field label="Meta Description">
            <Input value={String(form.seo_description ?? '')} onChange={(e) => set('seo_description', e.target.value)} />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">صورة المقال</p>
          <div className="flex flex-wrap items-center gap-3">
            {form.image ? (
              <div className="relative">
                <img src={getPublicUrl(form.image as string) ?? ''} alt="" className="h-24 w-36 rounded-xl object-cover" />
                <button type="button" onClick={() => { void deleteImage(form.image as string); set('image', null) }} className="absolute -left-2 -top-2 flex size-6 items-center justify-center rounded-full bg-error text-white cursor-pointer"><X className="size-3.5" /></button>
              </div>
            ) : (
              <label className="flex h-24 w-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary">
                <Upload className="size-6" /><span className="text-[10px] font-bold">رفع صورة</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => void upload(e.target.files)} />
              </label>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold', form.is_published ? 'border-primary bg-primary-light/50 text-primary-dark' : 'border-border text-muted')}>
            <input type="checkbox" className="hidden" checked={Boolean(form.is_published)} onChange={(e) => set('is_published', e.target.checked)} />
            منشور {Boolean(form.is_published) && '✓'}
          </label>
          <label className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold', form.is_featured ? 'border-primary bg-primary-light/50 text-primary-dark' : 'border-border text-muted')}>
            <input type="checkbox" className="hidden" checked={Boolean(form.is_featured)} onChange={(e) => set('is_featured', e.target.checked)} />
            مميّز {Boolean(form.is_featured) && '✓'}
          </label>
        </div>

        {error && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-error">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" loading={saving} className="flex-1">{isEdit ? 'حفظ التعديلات' : 'نشر المقال'}</Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Dialog>
  )
}