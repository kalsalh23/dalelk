import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check, Crown, Sparkles, Lock, ArrowUpRight } from 'lucide-react'
import { fetchSiteSettings } from '@/services/site'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeletons } from '@/components/ui/States'
import { PLANS } from '@/constants'
import { Seo } from '@/components/seo/Seo'
import { cn } from '@/lib/utils'

const planIcon: Record<string, typeof Sparkles> = { free: Lock, pro: Sparkles, gold: Crown }
const planColor: Record<string, string> = {
  free: 'bg-subtle-strong text-muted',
  pro: 'bg-primary-light text-primary-dark',
  gold: 'bg-gold-soft text-gold-dark',
}

export function PlansPage() {
  const navigate = useNavigate()

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSiteSettings,
  })
  const enabled = Boolean(settings?.subscriptions_enabled)

  const highlight = useMemo(() => 'gold', [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <Seo title="الاشتراكات والترقية" description="باقات الاشتراك لترقية ظهور صفحتك في دليل طيبة الإمام الطبي." />
      <div className="text-center">
        <h1 className="text-3xl font-black text-ink">باقات الاشتراك</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted">
          ارتقِ بظهور صفحتك في الدليل — يُفعّل الاشتراك لمدة شهر كامل من تاريخ الموافقة.
        </p>
        {enabled && (
          <Button size="lg" className="mt-5" onClick={() => navigate('/upgrade?plan=gold')}>
            <Sparkles className="size-4.5" />
            اطلب الترقية الآن
          </Button>
        )}
        <p className="mt-3 text-xs text-muted">
          لديك اشتراك فعّال؟ <Link to="/account" className="font-bold text-primary hover:underline">تسجيل دخول الجهة →</Link>
        </p>
      </div>

      {settingsLoading ? (
        <div className="mt-8"><Skeletons rows={3} box="!p-6" /></div>
      ) : !enabled ? (
        <Card className="mt-8">
          <CardBody className="py-14 text-center">
            <Lock className="mx-auto size-10 text-muted" />
            <h2 className="mt-4 text-xl font-black text-ink">الاشتراكات غير مفعّلة حالياً</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              حالياً جميع الجهات مدرجة على الباقة المجانية. عندما تُفعَّل الاشتراكات سيظهر هذا القسم مع خيارات الترقية.
            </p>
            <Link to="/" className="mt-6 inline-block text-sm font-bold text-primary hover:underline">العودة للرئيسية</Link>
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((p) => {
              const Icon = planIcon[p.key]
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => { if (p.key !== 'free') navigate(`/upgrade?plan=${p.key}`) }}
                  className={cn(
                    'cursor-pointer rounded-[20px] border-2 p-6 text-right transition-all',
                    highlight === p.key ? 'border-gold bg-gold-soft/30 shadow-lg' : 'border-border bg-surface hover:border-primary/40',
                    p.key === 'gold' && 'lg:-translate-y-2',
                  )}
                >
                  <div className={cn('mb-4 inline-flex size-12 items-center justify-center rounded-2xl', planColor[p.key])}>
                    <Icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-black text-ink">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted">{p.description}</p>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-muted">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <span className={cn('mt-5 block rounded-xl py-2.5 text-center text-sm font-black', p.key === 'free' ? 'bg-subtle text-muted' : 'bg-primary text-white')}>
                    {p.key === 'free' ? 'الباقة الأساسية لكل الجهات' : <>اطلب الترقية <ArrowUpRight className="ms-1 inline size-4" /></>}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-muted">
            لم تجد جهتك في الدليل؟ تواصل مع الإدارة لإضافتها أولاً، ثم قدّم طلب الترقية.
          </p>
        </>
      )}
    </div>
  )
}

