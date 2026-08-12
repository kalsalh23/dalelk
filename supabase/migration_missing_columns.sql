-- ترحيل: إضافة الأعمدة الناقصة للجداول القديمة (تطبيق متكرر آمن)
-- سبب: حفظ الصور من لوحة التحكم كان يفشل لأن بعض الجداول لم تكن تحتوي
-- الأعمدة الجديدة (gallery / is_featured / work_hours / video_url)

alter table public.clinics
  add column if not exists gallery text[] default '{}',
  add column if not exists is_featured boolean default false,
  add column if not exists video_url text;

alter table public.hospitals
  add column if not exists gallery text[] default '{}',
  add column if not exists is_featured boolean default false,
  add column if not exists video_url text;

alter table public.health_centers
  add column if not exists gallery text[] default '{}',
  add column if not exists is_featured boolean default false,
  add column if not exists video_url text;

alter table public.pharmacies
  add column if not exists gallery text[] default '{}',
  add column if not exists is_featured boolean default false,
  add column if not exists work_hours jsonb,
  add column if not exists video_url text;

alter table public.labs
  add column if not exists gallery text[] default '{}',
  add column if not exists is_featured boolean default false,
  add column if not exists work_hours jsonb,
  add column if not exists video_url text;

alter table public.radiology_centers
  add column if not exists gallery text[] default '{}',
  add column if not exists is_featured boolean default false,
  add column if not exists work_hours jsonb,
  add column if not exists video_url text;

-- تحديث ملف schema.sql ليتطابق (المرجع)