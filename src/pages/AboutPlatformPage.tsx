import { useQuery } from '@tanstack/react-query'
import { HeartPulse, MapPin, Phone, ShieldCheck, Stethoscope, Moon, MessageSquareText, Crown, Sparkles } from 'lucide-react'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Card, CardBody } from '@/components/ui/Card'
import { Seo } from '@/components/seo/Seo'
import { DeveloperFeatureCard } from '@/components/ui/DeveloperCard'
import { fetchSiteSettings } from '@/services/site'
import { APP_NAME, ABOUT_TEXT, DEFAULT_CITY } from '@/constants'

const FEATURES = [
  { icon: Stethoscope, title: 'دليل طبي موثّق', text: 'الأطباء والعيادات والمشافي والصيدليات والمراكز الصحية في مكان واحد.' },
  { icon: MapPin, title: 'مواقع على الخريطة', text: 'موقع كل جهة على الخريطة مع أقرب طريق للوصول.' },
  { icon: Moon, title: 'الصيدليات المناوبة', text: 'جدول المناوبة اليومي لمعرفة الصيدلية المفتوحة وقت الحاجة.' },
  { icon: MessageSquareText, title: 'اسأل دليلك الطبي', text: 'قاعدة أسئلة وأجوبة صحية ونصائح طبية موثوقة ومبسطة.' },
  { icon: Crown, title: 'باقات للجهات', text: 'باقات اشتراك شهرية تُبرز الجهة وتضاعف ظهورها في الدليل.' },
  { icon: ShieldCheck, title: 'بيانات محدّثة', text: 'أرقام الهواتف وساعات الدوام تُراجع وتُحدّث باستمرار من فريق المنصة.' },
]

export function AboutPlatformPage() {
  const { data: settings } = useQuery({ queryKey: ['site-settings'], queryFn: fetchSiteSettings })
  const aboutText = settings?.about?.content ?? ABOUT_TEXT

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Seo
        title="عن المنصة"
        description={`${APP_NAME} — منصة رقمية تجمع كل الخدمات الصحية في مدينة ${DEFAULT_CITY}: الدليل، الخريطة، المناوبة، والنصائح الطبية.`}
        path="/about-platform"
        type="website"
      />
      <Breadcrumbs items={[{ label: 'الرئيسية', to: '/' }, { label: 'عن المنصة' }]} />

      {/* ترويسة */}
      <div className="mt-4 overflow-hidden rounded-[22px] bg-gradient-to-bl from-primary to-primary-dark p-6 text-white sm:p-9">
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold text-gold w-fit">
          <Sparkles className="size-3.5" />
          عن المنصة
        </div>
        <h1 className="mt-3 text-2xl font-black sm:text-3xl">{APP_NAME}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-8 text-white/85">
          منصة رقمية شاملة تجمع كل الخدمات الصحية في مدينة {DEFAULT_CITY} — من الطبيب المناسب إلى الصيدلية المناوبة — في تجربة واحدة سريعة وسهلة من هاتفك.
        </p>
      </div>

      {/* نبذة مختصرة */}
      <Card className="mt-6">
        <CardBody>
          <div className="flex items-center gap-2 pb-2">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-white">
              <HeartPulse className="size-5" />
            </div>
            <h2 className="text-lg font-black text-ink">ما هي {APP_NAME}؟</h2>
          </div>
          <p className="text-sm leading-8 text-muted">{aboutText}</p>
        </CardBody>
      </Card>

      {/* ما تقدمه المنصة */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Card key={f.title} className="transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <CardBody className="flex items-start gap-3.5">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-dark">
                <f.icon className="size-5.5" />
              </div>
              <div>
                <p className="font-black text-ink">{f.title}</p>
                <p className="mt-1 text-xs leading-6 text-muted">{f.text}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* بطاقة المطور المميزة */}
      <div className="mt-8">
        <DeveloperFeatureCard developer={settings?.developer} />
      </div>

      {/* دعم المنصة */}
      <Card className="mt-6">
        <CardBody className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black text-ink">دعم المنصة والإدارة</p>
            <p className="mt-1 text-xs text-muted">للإبلاغ عن خطأ في البيانات أو إضافة جهة جديدة أو الاستفسار عن الباقات.</p>
          </div>
          <a
            href={`tel:${settings?.about?.support_phone ?? ''}`}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            <Phone className="size-4" />
            <span dir="ltr">{settings?.about?.support_phone ?? '—'}</span>
          </a>
        </CardBody>
      </Card>
    </div>
  )
}
