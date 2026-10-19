// يُحدّث trigger notify_doctor_new_appointment ليُرسل الحقل الصحيح لـ bridge-clinic-booking
// الاستخدام: SUPABASE_MANAGEMENT_TOKEN=... SUPABASE_PROJECT_REF=... node supabase/patch-bridge-trigger.mjs
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const token = process.env.SUPABASE_MANAGEMENT_TOKEN
const projectRef = process.env.SUPABASE_PROJECT_REF

if (!token || !projectRef) {
  console.error('أعد تعيين SUPABASE_MANAGEMENT_TOKEN و SUPABASE_PROJECT_REF')
  process.exit(1)
}

const sql = await readFile(join(__dirname, 'migration_bridge.sql'), 'utf8')
const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ query: sql }),
})
const text = await res.text()
if (!res.ok && !text.includes('42710') && !text.includes('42701') && !text.includes('42P07')) {
  console.error('فشل تطبيق migration_bridge.sql:', res.status)
  console.error(text.slice(0, 2000))
  process.exit(1)
}
console.log('✓ تم إعادة إنشاء trigger notify_doctor_new_appointment بـ payload مصحح')