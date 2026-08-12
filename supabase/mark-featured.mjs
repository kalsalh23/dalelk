// تمييز أطباء حقيقيين في الشاشة الرئيسية (is_featured)
// الاستخدام: node supabase/mark-featured.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const adminEmail = process.env.ADMIN_EMAIL || 'admin@dalil.com'
const adminPass = process.env.ADMIN_PASSWORD || 'dalil@2026'

if (!url || !anonKey) {
  console.error('أعد تعيين SUPABASE_URL و SUPABASE_ANON_KEY')
  process.exit(1)
}

const sb = createClient(url.replace(/\/rest\/v1\/?$/, ''), anonKey, {
  auth: { persistSession: false },
})

const { data: session, error: le } = await sb.auth.signInWithPassword({ email: adminEmail, password: adminPass })
if (le) {
  console.error('تعذّر تسجيل دخول المدير:', le.message)
  process.exit(1)
}
console.log('✓ تسجيل دخول المدير:', session.user?.email)

const { data, error: qe } = await sb.from('doctors').select('id, name, is_featured')
if (qe) {
  console.error('select failed:', qe.message)
  process.exit(1)
}
console.log('الأطباء:', JSON.stringify(data, null, 2))
console.log('الأطباء:', JSON.stringify(data, null, 2))

// أطباء مميّزون: هشام الخطاب، سامي الرحال، أيمن العبد الله، أحمد العتر
const featured = ['هشام الخطاب', 'سامي الرحال', 'أيمن العبد الله', 'أحمد العتر']

for (const r of data ?? []) {
  const matches = featured.some((f) => String(r.name ?? '').includes(f))
  if (matches !== r.is_featured) {
    const { error: ue } = await sb.from('doctors').update({ is_featured: matches }).eq('id', r.id)
    if (ue) console.error('فشل تحديث', r.name, ue.message)
    else console.log('✓', r.name, '->', matches ? 'مميّز' : 'غير مميّز')
  }
}
console.log('انتهى')