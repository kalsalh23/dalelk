-- ترحيل: إضافة حسابي فيسبوك وانستغرام لجميع كيانات المنصة
-- سبب: إضافة أيقونات برامجواصل عبر روابط قابلة للتعديل من لوحة التحكم

alter table public.doctors
  add column if not exists facebook text,
  add column if not exists instagram text;

alter table public.clinics
  add column if not exists facebook text,
  add column if not exists instagram text;

alter table public.hospitals
  add column if not exists facebook text,
  add column if not exists instagram text;

alter table public.health_centers
  add column if not exists facebook text,
  add column if not exists instagram text;

alter table public.pharmacies
  add column if not exists facebook text,
  add column if not exists instagram text;

alter table public.labs
  add column if not exists facebook text,
  add column if not exists instagram text;

alter table public.radiology_centers
  add column if not exists facebook text,
  add column if not exists instagram text;