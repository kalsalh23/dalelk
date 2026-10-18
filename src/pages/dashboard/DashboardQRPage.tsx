import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import QRCode from 'qrcode'
import { QrCode, Download, Printer, ExternalLink } from 'lucide-react'
import { useDashboardSession } from '@/layouts/DashboardLayout'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/components/seo/Seo'
import { APP_FULL_NAME } from '@/constants'

/** رمز QR جاهز للطباعة — يفتح صفحة الجهة عند المسح */
export function DashboardQRPage() {
  const { session } = useDashboardSession()
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  const routeLink = session
    ? session.entity_type === 'health_center'
      ? 'health-centers'
      : session.entity_type === 'radiology'
        ? 'radiology'
        : `${session.entity_type}s`
    : ''
  const url = useMemo(() => {
    if (!session) return ''
    return `${window.location.origin}/${routeLink}/${encodeURIComponent(session.slug)}`
  }, [session, routeLink])

  const name = String((session?.entity as Record<string, unknown> | null)?.name ?? '')
  const specialty = String((session?.entity as Record<string, unknown> | null)?.specialty ?? '')

  useEffect(() => {
    if (!session) return
    QRCode.toDataURL(url, {
      width: 640,
      margin: 2,
      color: { dark: '#054239', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    })
      .then((d) => setDataUrl(d))
      .catch(() => setError(true))
  }, [session, url])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'qr-dalil-altaybeh.png'
    a.click()
  }

  const print = () => {
    if (!dataUrl) return
    const w = window.open('', '_blank', 'width=640,height=800')
    if (!w) return
    w.document.write(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>بطاقة ${name}</title>
      <style>
        body { font-family: 'IBM Plex Sans Arabic', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f3f0e7; }
        .card { text-align: center; padding: 40px 48px; background: #fff; border: 3px solid #054239; border-radius: 24px; }
        .brand { color: #054239; font-size: 15px; font-weight: 700; letter-spacing: 0.3px; margin-bottom: 18px; }
        img.qr { width: 300px; height: 300px; display: block; margin: 0 auto; }
        h1 { color: #161616; font-size: 26px; margin: 18px 0 4px; }
        p.spec { color: #428177; font-weight: 700; margin: 0 0 10px; font-size: 14px; }
        p.hint { color: #666; font-size: 13px; margin: 12px 0 0; }
        p.url { color: #999; font-size: 10px; direction: ltr; margin: 6px 0 0; }
      </style></head><body>
      <div class="card">
        <div class="brand">${APP_FULL_NAME}</div>
        <img class="qr" src="${dataUrl}" alt="QR" />
        <h1>${name}</h1>
        ${specialty ? `<p class="spec">${specialty}</p>` : ''}
        <p class="hint">امسح الرمز لعرض صفحتي وخدماتي</p>
        <p class="url">${url}</p>
      </div>
      <script>window.onload = function () { window.print() }<\/script>
      </body></html>`)
    w.document.close()
  }

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

  return (
    <div className="space-y-6">
      <Seo title="رمز QR لصفحتي" description="بطاقة رمز QR جاهزة للطباعة والتعليق في عيادتك" />
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-ink">
          <QrCode className="size-6 text-primary" />
          رمز QR لصفحتي
        </h1>
        <p className="mt-1 text-sm text-muted">اطبع البطاقة وعلّقها في عيادتك أو صيدليتك — مسح الرمز يفتح صفحتك مباشرة.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardBody className="flex flex-col items-center gap-5 p-8 text-center">
            {error ? (
              <p className="text-sm text-error">تعذر توليد الرمز، أعد تحميل الصفحة.</p>
            ) : !dataUrl ? (
              <div className="flex size-72 animate-pulse items-center justify-center rounded-2xl bg-subtle text-sm text-muted">جارٍ التوليد…</div>
            ) : (
              <img src={dataUrl} alt="رمز QR" className="w-64 rounded-2xl border-4 border-primary-dark shadow-lg" />
            )}
            <p className="text-sm font-black text-ink">{name}</p>
            <p className="-mt-3 text-xs text-muted" dir="ltr">{url}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={download} disabled={!dataUrl}>
                <Download className="size-4" /> تنزيل الصورة
              </Button>
              <Button variant="secondary" onClick={print} disabled={!dataUrl}>
                <Printer className="size-4" /> طباعة البطاقة
              </Button>
              <Button variant="outline" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" /> فتح صفحتي
                </a>
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardBody className="space-y-3 p-5 text-sm leading-7 text-muted">
            <p className="font-black text-ink">أفكار للاستفادة من الرمز:</p>
            <p>🖨️ اطبعه وعلّقه عند باب العيادة أو الاستقبال.</p>
            <p>📱 أرسل صورته عبر واتساب لمرضاك الدائمين.</p>
            <p>🗂️ أضفه إلى بطاقتك الشخصية أو لافتة العيادة.</p>
            <p>📋 ضعه على استمارة الوصفات أو أوراق الاستقبال.</p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
