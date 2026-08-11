// إنشاء/تحديث حساب المدير
// الاستخدام: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... ADMIN_EMAIL=... ADMIN_PASSWORD=... node supabase/create-admin.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL || 'admin@dalil.com'
const password = process.env.ADMIN_PASSWORD || ''

if (!url || !serviceKey || !password) {
  console.error('أعد تعيين SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY و ADMIN_PASSWORD')
  process.exit(1)
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } })

const { data: existing, error: listErr } = await sb.auth.admin.listUsers()
const user = existing?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

if (user) {
  const { error: updateErr } = await sb.auth.admin.updateUserById(user.id, { password, email_confirm: true, user_metadata: { name: 'مسؤول المنصة' } })
  if (updateErr) throw updateErr
  const { error: upErr } = await sb.from('profiles').upsert({ id: user.id, name: 'مسؤول المنصة', is_admin: true })
  if (upErr) throw upErr
  console.log(`✓ تم تحديث المدير: ${email}`)
} else {
  const { data: created, error: createErr } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'مسؤول المنصة' },
  })
  if (createErr) throw createErr
  const userId = created.user?.id ?? created.id
  if (!userId) throw new Error('لم يتم إرجاع معرف المستخدم')
  const { error: upErr } = await sb.from('profiles').upsert({ id: userId, name: 'مسؤول المنصة', is_admin: true })
  if (upErr) throw upErr
  console.log(`✓ تم إنشاء المدير: ${email}`)
}