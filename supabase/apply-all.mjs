// يطبّق جميع migrations على مشروع سوبابيس عبر Management API
// الاستخدام: SUPABASE_MANAGEMENT_TOKEN=... SUPABASE_PROJECT_REF=... node supabase/apply-all.mjs
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

const files = [
  'migration_appointments.sql',
  'migration_booking_rpcs.sql',
  'migration_bridge.sql',
  'migration_one_booking.sql',
  'migration_doctor_extras.sql',
  'migration_doctor_qa.sql',
  'migration_push_notifications.sql',
  'migration_push_reliability.sql',
  'migration_social_media.sql',
  'migration_notifications_v2.sql',
  'migration_magic_link.sql',
  'migration_entity_accounts.sql',
  'migration_entity_dashboard.sql',
  'migration_entity_trials.sql',
  'migration_trials_reusable.sql',
  'migration_ads_about.sql',
  'migration_ads_expiry.sql',
  'migration_duty_times.sql',
  'migration_missing_columns.sql',
  'migration_doctors_description.sql',
  'migration_featured.sql',
  'migration_incr.sql',
]

async function run(file) {
  const sql = await readFile(join(__dirname, file), 'utf8')
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: sql }),
  })
  const text = await res.text()
  if (!res.ok) {
    if (text.includes('already exists') || text.includes('42710') || text.includes('42701') || text.includes('42P07') || text.includes('42704') || text.includes('does not exist')) {
      console.log(`⚠ ${file}: تخطي (موجود/غير موجود مسبقاً)`)
      return
    }
    console.error(`فشل (${file}):`, res.status)
    console.error(text.slice(0, 1500))
    process.exit(1)
  }
  console.log(`✓ ${file}`)
}

for (const f of files) {
  await run(f)
}
console.log('تم تطبيق جميع migrations بنجاح ✓')