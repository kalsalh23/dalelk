import { useCallback, useEffect, useState } from 'react'
import { HelpCircle, Plus, Trash2, MessageSquareText, Crown, Lock, Search } from 'lucide-react'
import { useDashboardSession } from '@/layouts/DashboardLayout'
import { readStoredSession, doctorQaList, doctorQaAdd, doctorQaDelete, type DoctorQaState, type DoctorQaItem } from '@/services/entityAccount'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Skeletons, EmptyState } from '@/components/ui/States'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { Link } from 'react-router-dom'

const PLAN_LABELS: Record<string, string> = { free: 'المجانية', pro: 'الاحترافية', gold: 'الذهبية' }

/** واجهة «اكتب سؤالك»: الطبيب يضيف سؤالاً مع إجابته ليظهر لمواطني «اسأل دليلك» */
export function DashboardQAPage() {
  const { session } = useDashboardSession()
  const toast = useToast()
  const isDoctor = session?.entity_type === 'doctor'

  const [data, setData] = useState<DoctorQaState | null>(null)
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [keywords, setKeywords] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<DoctorQaItem | null>(null)

  const load = useCallback(async () => {
    const token = readStoredSession()?.token
    if (!token) return
    setLoading(true)
    const res = await doctorQaList(token)
    setData(res)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isDoctor) void load()
    else setLoading(false)
  }, [isDoctor, load])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = readStoredSession()?.token
    if (!token) return
    if (question.trim().length < 5 || answer.trim().length < 5) {
      toast.show('اكتب السؤال والإجابة بشكل كامل', 'error')
      return
    }
    setSaving(true)
    const res = await doctorQaAdd(token, question.trim(), answer.trim(), keywords.trim())
    setSaving(false)
    if (!res || res.error) {
      toast.show(res?.error ?? 'تعذر إضافة السؤال', 'error')
      return
    }
    toast.show('تمت إضافة السؤال — سيظهر لمواطني «اسأل دليلك»')
    setQuestion('')
    setAnswer('')
    setKeywords('')
    void load()
  }

  const remove = async () => {
    const token = readStoredSession()?.token
    if (!token || !deleting) return
    const res = await doctorQaDelete(token, deleting.id)
    if (!res || res.error) {
      toast.show(res?.error ?? 'تعذر حذف السؤال', 'error')
      return
    }
    toast.show('تم حذف السؤال')
    setDeleting(null)
    void load()
  }

  // غير مخصص للأطباء
  if (session && !isDoctor) {
    return (
      <Card>
        <CardBody className="p-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-subtle text-muted">
            <Lock className="size-6" />
          </div>
          <h1 className="mt-4 text-lg font-black text-ink">هذه الواجهة مخصصة للأطباء</h1>
          <p className="mt-2 text-sm text-muted">ميزة «اكتب سؤالك» متاحة لحسابات الأطباء فقط.</p>
        </CardBody>
      </Card>
    )
  }

  // غير مسجل الدخول
  if (!session) {
    return (
      <Card>
        <CardBody className="p-10 text-center">
          <h1 className="text-lg font-black text-ink">سجّل دخولك أولاً</h1>
          <Link to="/dashboard/login" className="mt-4 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark">
            صفحة الدخول
          </Link>
        </CardBody>
      </Card>
    )
  }

  const plan = data?.plan ?? 'free'
  const limit = data?.limit ?? 0
  const count = data?.count ?? 0
  const canAdd = plan !== 'free' && count < limit
  const pct = limit ? Math.min(100, Math.round((count / limit) * 100)) : 0
  const items = data?.items ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-ink">
          <HelpCircle className="size-6 text-primary" />
          اكتب سؤالك
        </h1>
        <p className="mt-1 text-sm text-muted">أضف سؤالاً شائعاً مع إجابته — سيراها المواطن تلقائياً عند سؤاله في «اسأل دليلك».</p>
      </div>

      {loading ? (
        <Skeletons rows={3} />
      ) : data?.error && data.error !== 'unauthorized' ? (
        <Card><CardBody className="p-6 text-sm text-error">{data.error}</CardBody></Card>
      ) : (
        <>
          {/* مؤشر الباقة والحد */}
          <Card>
            <CardBody className="p-5">
              {plan === 'free' ? (
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2 rounded-xl bg-gold-soft px-3 py-2 text-xs font-bold text-gold-dark">
                    <Lock className="size-4" />
                    باقتك الحالية: المجانية
                  </div>
                  <p className="text-sm text-muted">إضافة الأسئلة متاحة لأصحاب الباقة الاحترافية (25 سؤالاً) أو الذهبية (100 سؤال).</p>
                  <Link to="/plans" className="sm:ms-auto">
                    <Button size="sm">
                      <Crown className="size-4" />
                      ترقية الباقة
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <p className="font-bold text-ink">
                      استهلكت <span className={cnCount(count, limit)}>{count}</span> من أصل {limit} سؤال
                      <span className="ms-2 rounded-full bg-gold-soft px-2.5 py-0.5 text-[11px] font-bold text-gold-dark">
                        باقة {PLAN_LABELS[plan]}
                      </span>
                    </p>
                    {count >= limit && <span className="rounded-full bg-wine-soft px-2.5 py-1 text-[11px] font-bold text-error">وصلت الحد الأقصى</span>}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-subtle">
                    <div
                      className={cnBar(pct)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* نموذج الإضافة */}
          {canAdd ? (
            <Card>
              <CardBody className="p-5 sm:p-6">
                <h2 className="mb-4 flex items-center gap-2 text-base font-black text-ink">
                  <Plus className="size-4.5 text-primary" />
                  إضافة سؤال جديد
                </h2>
                <form onSubmit={submit} className="space-y-4">
                  <Field label="السؤال" required>
                    <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="مثال: ما هو العلاج المنزلي لنزلة البرد؟" />
                  </Field>
                  <Field label="الإجابة" required>
                    <Textarea rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="اكتب إجابة واضحة ومبسطة للمواطن…" />
                  </Field>
                  <Field label="كلمات مفتاحية (اختياري)" hint="مفصولة بفاصلة — تساعد مطابقة سؤال المواطن مع إجابتك، مثال: برد، زكام، سعال، رشح">
                    <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="برد، زكام، سعال" />
                  </Field>
                  <Button type="submit" loading={saving}>
                    <Plus className="size-4" />
                    إضافة السؤال
                  </Button>
                </form>
              </CardBody>
            </Card>
          ) : null}

          {/* قائمة الأسئلة المضافة */}
          <Card>
            <CardBody className="p-5 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-black text-ink">
                <MessageSquareText className="size-4.5 text-primary" />
                أسئلتي المضافة ({items.length})
              </h2>
              {!items.length ? (
                <EmptyState title="لم تضف أسئلة بعد" description="ابدأ بإضافة أول سؤال شائع مع إجابته ليستفيد منه المواطنون." />
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-border bg-subtle/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="flex items-start gap-2 text-sm font-bold text-ink">
                          <Search className="mt-0.5 size-4 shrink-0 text-primary" />
                          {item.question}
                        </p>
                        <button
                          onClick={() => setDeleting(item)}
                          title="حذف"
                          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:border-error hover:text-error"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="mt-2 line-clamp-2 whitespace-pre-line text-xs leading-6 text-muted">{item.answer}</p>
                      <p className="mt-2 text-[10px] font-bold text-muted">{formatDate(item.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
        title="حذف السؤال"
        message={`هل أنت متأكد من حذف «${deleting?.question ?? ''}»؟ لن يظهر جوابه للمواطن بعد الحذف.`}
        loading={false}
      />
    </div>
  )
}

function cnCount(count: number, limit: number): string {
  return count >= limit ? 'text-error' : 'text-primary'
}
function cnBar(pct: number): string {
  return pct >= 100 ? 'h-full rounded-full bg-error' : 'h-full rounded-full bg-primary'
}
