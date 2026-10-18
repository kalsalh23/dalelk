import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Info, Phone, Code2 } from 'lucide-react'
import { InstagramIcon, FacebookIcon } from '@/components/ui/BrandIcons'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeletons } from '@/components/ui/States'
import { useToast } from '@/components/ui/Toast'
import { fetchSiteSettings, saveSiteSettings } from '@/services/site'

export function AdminAboutSettingsPage() {
  const qc = useQueryClient()
  const toast = useToast()
  const [form, setForm] = useState<{
    content: string
    support_phone: string
    support_email: string
    developer_name: string
    developer_title: string
    developer_phone: string
    developer_international_phone: string
    developer_instagram: string
    developer_facebook: string
  } | null>(null)
  const [saving, setSaving] = useState(false)

  const { isLoading } = useQuery({
    queryKey: ['admin-about'],
    queryFn: async () => {
      const s = await fetchSiteSettings()
      setForm({
        content: String(s.about?.content ?? ''),
        support_phone: String(s.about?.support_phone ?? ''),
        support_email: String(s.about?.support_email ?? ''),
        developer_name: String(s.developer?.name ?? 'م. قصي مهند الصالح'),
        developer_title: String(s.developer?.title ?? 'مطوّر المنصة'),
        developer_phone: String(s.developer?.phone ?? '0952639157'),
        developer_international_phone: String(s.developer?.international_phone ?? '+963952639157'),
        developer_instagram: String(s.developer?.instagram ?? ''),
        developer_facebook: String(s.developer?.facebook ?? ''),
      })
      return s
    },
  })

  const set = <K extends keyof NonNullable<typeof form>>(k: K, v: string) =>
    setForm((f) => (f ? { ...f, [k]: v } : f))

  const save = async () => {
    if (!form) return
    setSaving(true)
    const ok = await saveSiteSettings({
      about: {
        content: form.content,
        support_phone: form.support_phone,
        support_email: form.support_email,
      },
      developer: {
        name: form.developer_name,
        title: form.developer_title,
        phone: form.developer_phone,
        international_phone: form.developer_international_phone,
        instagram: form.developer_instagram,
        facebook: form.developer_facebook,
      },
    })
    setSaving(false)
    if (ok) {
      await qc.invalidateQueries({ queryKey: ['admin-about'] })
      await qc.invalidateQueries({ queryKey: ['site-settings'] })
      toast.show('تم حفظ الإعدادات')
    } else {
      toast.show('تعذر الحفظ', 'error')
    }
  }

  if (isLoading || !form) return <Skeletons rows={4} box="!p-5" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink">من نحن والتواصل</h1>
        <p className="mt-0.5 text-sm text-muted">محتوى صفحة «من نحن» وبيانات الدعم الفني وبيانات مطوّر المنصة</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="size-5 text-primary" />
            محتوى صفحة من نحن
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Field label="الوصف التعريفي">
            <Textarea rows={5} value={form.content} onChange={(e) => set('content', e.target.value)} />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="size-5 text-primary" />
            الدعم الفني
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="رقم الدعم">
              <Input dir="ltr" value={form.support_phone} onChange={(e) => set('support_phone', e.target.value)} placeholder="+963…" />
            </Field>
            <Field label="بريد الدعم">
              <Input type="email" dir="ltr" value={form.support_email} onChange={(e) => set('support_email', e.target.value)} placeholder="support@…" />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="size-5 text-primary" />
            مطوّر المنصة
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم">
              <Input value={form.developer_name} onChange={(e) => set('developer_name', e.target.value)} />
            </Field>
            <Field label="الصفة/اللقب">
              <Input value={form.developer_title} onChange={(e) => set('developer_title', e.target.value)} />
            </Field>
            <Field label="رقم الاتصال المحلي">
              <Input dir="ltr" value={form.developer_phone} onChange={(e) => set('developer_phone', e.target.value)} />
            </Field>
            <Field label="رقم الاتصال الدولي">
              <Input dir="ltr" value={form.developer_international_phone} onChange={(e) => set('developer_international_phone', e.target.value)} />
            </Field>
            <Field label="رابط إنستغرام">
              <Input dir="ltr" value={form.developer_instagram} onChange={(e) => set('developer_instagram', e.target.value)} placeholder="https://instagram.com/…" />
            </Field>
            <Field label="رابط فيسبوك">
              <Input dir="ltr" value={form.developer_facebook} onChange={(e) => set('developer_facebook', e.target.value)} placeholder="https://facebook.com/…" />
            </Field>
          </div>
          <div className="flex gap-2 rounded-xl bg-slate-50 p-3 text-xs text-muted">
            <InstagramIcon className="size-4 shrink-0 text-primary" />
            <FacebookIcon className="size-4 shrink-0 text-primary" />
            تُستخدم هذه الروابط في بطاقة المطوّر داخل صفحة من نحن وفي تذييل الموقع (Footer).
          </div>
          <Button onClick={() => void save()} loading={saving}>حفظ الإعدادات</Button>
        </CardBody>
      </Card>
    </div>
  )
}