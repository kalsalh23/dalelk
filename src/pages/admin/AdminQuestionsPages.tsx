import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, CheckCircle2, Send, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog, ConfirmDialog } from '@/components/ui/Dialog'
import { Skeletons, EmptyState } from '@/components/ui/States'
import { Pagination } from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'
import { ARTICLE_CATEGORIES } from '@/constants'

export function AdminQuestionsPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const { data, isLoading } = useQuery({
    queryKey: ['admin-questions', page],
    queryFn: async () => {
      const { data, count } = await supabase
        .from('medical_questions')
        .select('*, medical_keywords(keyword)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      return {
        data: (data ?? []).map((d) => ({
          ...d,
          keywords: (d.medical_keywords ?? []).map((k: { keyword: string }) => k.keyword).join('، '),
        })) as Array<Record<string, unknown>>,
        count: count ?? 0,
      }
    },
  })

  const del = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      await supabase.from('medical_keywords').delete().eq('question_id', String(row.id))
      await supabase.from('medical_questions').delete().eq('id', String(row.id))
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-questions'] }); toast.show('تم الحذف'); setDeleting(null) },
    onError: () => toast.show('تعذر الحذف', 'error'),
  })

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink">الأسئلة والأجوبة</h1>
          <p className="mt-0.5 text-sm text-muted">قاعدة المعرفة الطبية — {data?.count ?? '…'} سؤال</p>
        </div>
        <Button onClick={() => setEditing({})}><Plus className="size-4.5" /> سؤال جديد</Button>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary-light/30 px-4 py-3 text-sm text-primary-dark">
        كل سؤال يدعم عدد غير محدود من الكلمات المفتاحية، وتُستخدم الآن في البحث داخل «اسأل دليلك الطبي».
      </div>

      {isLoading ? (
        <Skeletons rows={5} box="!p-5" />
      ) : !data?.data.length ? (
        <EmptyState title="لا توجد أسئلة" description="أضف أول سؤال وإجابة إلى قاعدة المعرفة." />
      ) : (
        <>
          <div className="space-y-2">
            {data.data.map((q) => (
              <Card key={String(q.id)} className="flex items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-ink">{String(q.question)}</p>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', q.is_active ? 'bg-emerald-50 text-success' : 'bg-slate-100 text-muted')}>
                      {q.is_active ? 'مفعّل' : 'مخفّي'}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted">{String(q.answer ?? '')}</p>
                  {q.keywords ? <p className="mt-1 text-[11px] text-primary-dark">الكلمات المفتاحية: {String(q.keywords)}</p> : null}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setEditing({ ...q })} className="flex size-9 items-center justify-center rounded-xl border border-border text-muted hover:border-primary hover:text-primary cursor-pointer"><Pencil className="size-4" /></button>
                  <button onClick={() => setDeleting(q)} className="flex size-9 items-center justify-center rounded-xl border border-border text-muted hover:border-error hover:text-error cursor-pointer"><Trash2 className="size-4" /></button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {editing !== null && (
        <QuestionForm
          values={editing}
          onClose={() => setEditing(null)}
          onDone={() => { setEditing(null); void qc.invalidateQueries({ queryKey: ['admin-questions'] }) }}
        />
      )}
      <ConfirmDialog open={deleting !== null} onClose={() => setDeleting(null)} onConfirm={() => deleting && del.mutate(deleting)} title="حذف السؤال" message={`حذف «${String(deleting?.question ?? '')}» وجميع كلماته المفتاحية؟`} loading={del.isPending} />
    </div>
  )
}

function QuestionForm({ values, onClose, onDone }: { values: Record<string, unknown>; onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ ...values })
  const [keywords, setKeywords] = useState(String(values.keywords ?? '').split('،').join('\n'))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  const isEdit = Boolean(values.id)
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!String(form.question ?? '').trim() || !String(form.answer ?? '').trim()) {
      setError('السؤال والإجابة مطلوبان')
      return
    }
    setSaving(true)
    const qPayload = {
      question: String(form.question ?? '').trim(),
      answer: String(form.answer ?? '').trim(),
      category_id: String(form.category_id ?? '') || null,
      is_active: Boolean(form.is_active),
      updated_at: new Date().toISOString(),
    }
    const kw = keywords.split('\n').map((k) => k.trim()).filter(Boolean)

    let qResult
    if (isEdit) {
      qResult = await supabase.from('medical_questions').update(qPayload).eq('id', String(values.id)).select().single()
      await supabase.from('medical_keywords').delete().eq('question_id', String(values.id))
    } else {
      qResult = await supabase.from('medical_questions').insert(qPayload).select().single()
    }
    if (qResult.error) { setSaving(false); setError(qResult.error.message); return }

    if (kw.length && qResult.data) {
      await supabase.from('medical_keywords').insert(kw.map((keyword) => ({ question_id: qResult.data.id, keyword })))
    }
    setSaving(false)
    toast.show(isEdit ? 'تم حفظ السؤال' : 'تمت الإضافة')
    onDone()
  }

  return (
    <Dialog open onClose={onClose} title={isEdit ? 'تعديل السؤال' : 'سؤال جديد'} size="lg">
      <form onSubmit={submit} className="space-y-5">
        <Field label="السؤال" required>
          <Input value={String(form.question ?? '')} onChange={(e) => set('question', e.target.value)} required />
        </Field>
        <Field label="الإجابة" required>
          <Textarea rows={6} value={String(form.answer ?? '')} onChange={(e) => set('answer', e.target.value)} />
        </Field>
        <Field label="الكلمات المفتاحية (كل كلمة في سطر)" hint="على سبيل المثال: سعال، كحة، كحه، سعال جاف — تُستخدم لمطابقة السؤال.">
          <Textarea rows={4} value={keywords} onChange={(e) => setKeywords(e.target.value)} />
        </Field>
        <Field label="التصنيف">
          <select
            value={String(form.category_id ?? '')}
            onChange={(e) => set('category_id', e.target.value)}
            className="h-11 w-full cursor-pointer rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            <option value="">— بدون تصنيف —</option>
            {ARTICLE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <label className={cn('flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold', form.is_active ? 'border-primary bg-primary-light/50 text-primary-dark' : 'border-border text-muted')}>
          <input type="checkbox" className="hidden" checked={Boolean(form.is_active)} onChange={(e) => set('is_active', e.target.checked)} />
          <CheckCircle2 className={cn('size-4.5', form.is_active ? 'text-success' : 'text-muted')} />
          السؤال مفعّل ويظهر في نتائج «اسأل دليلك الطبي»
        </label>
        {error && <p className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-error">{error}</p>}
        <div className="flex gap-3">
          <Button type="submit" loading={saving} className="flex-1">{isEdit ? 'حفظ التعديلات' : 'إضافة السؤال'}</Button>
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </form>
    </Dialog>
  )
}

export function AdminUnansweredPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [page, setPage] = useState(1)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const PAGE_SIZE = 10

  const { data, isLoading } = useQuery({
    queryKey: ['admin-unanswered', page],
    queryFn: async () => {
      const { data, count } = await supabase
        .from('unanswered_questions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      return { data: (data ?? []) as Array<Record<string, unknown>>, count: count ?? 0 }
    },
  })

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE))

  const answerMutation = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      const answer = answers[String(row.id)]?.trim()
      if (!answer) throw new Error('أدخل الإجابة أولاً')
      const { data: qRes, error } = await supabase
        .from('medical_questions')
        .insert({ question: String(row.question), answer })
        .select()
        .single()
      if (error) throw error
      await supabase.from('medical_keywords').insert([{ question_id: qRes.id, keyword: String(row.question) }])
      await supabase.from('unanswered_questions').delete().eq('id', String(row.id))
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-unanswered'] }); void qc.invalidateQueries({ queryKey: ['admin-questions'] }); toast.show('تم تحويله لسؤال مجاب') },
  })

  const del = useMutation({
    mutationFn: async (row: Record<string, unknown>) => {
      await supabase.from('unanswered_questions').delete().eq('id', String(row.id))
    },
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin-unanswered'] }); toast.show('تم حذف السؤال') },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">الأسئلة غير المجاب عنها</h1>
        <p className="mt-0.5 text-sm text-muted">أسئلة أرسلها الزوار عبر «اسأل دليلك الطبي» ولم يجدوا لها إجابة ({data?.count ?? '…'})</p>
      </div>
      {isLoading ? (
        <Skeletons rows={5} box="!p-5" />
      ) : !data?.data.length ? (
        <EmptyState title="لا توجد أسئلة معلقة" description="جميع الأسئلة مجاب عنها." />
      ) : (
        <>
          <div className="space-y-3">
            {data.data.map((row) => (
              <Card key={String(row.id)} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <Send className="size-4.5" />
                    </div>
                    <div>
                      <p className="font-bold text-ink">{String(row.question)}</p>
                      <p className="mt-1 flex items-center gap-2 text-[11px] text-muted">
                        <span>أرسل في {new Date(String(row.created_at)).toLocaleDateString('ar-SY')}</span>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 font-bold text-amber-700">بدون إجابة</span>
                      </p>
                    </div>
                  </div>
                  <button onClick={() => del.mutate(row)} className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-error cursor-pointer"><Trash2 className="size-4" /></button>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Textarea
                    rows={2}
                    placeholder="اكتب الإجابة هنا… ثم اضغط «نشر كسؤال مجاب» لتصبح الإجابة متاحة للزوار."
                    value={answers[String(row.id)] ?? ''}
                    onChange={(e) => setAnswers((a) => ({ ...a, [String(row.id)]: e.target.value }))}
                    className="flex-1"
                  />
                  <Button loading={answerMutation.isPending} onClick={() => answerMutation.mutate(row)} className="sm:w-auto">
                    <Save className="size-4.5" />
                    نشر كسؤال مجاب
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  )
}