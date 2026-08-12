-- ترحيل: وقت انتهاء الإعلان (تطبيق متكرر آمن)
alter table public.advertisements
  add column if not exists expires_at timestamptz;