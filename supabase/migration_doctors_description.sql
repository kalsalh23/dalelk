-- ترحيل: إضافة عمود description لجدول الأطباء (تطبيق متكرر آمن)
-- سبب: إضافة/تعديل طبيب من لوحة التحكم كان يفشل بخطأ
-- PGRST204: Could not find the 'description' column of 'doctors' in the schema cache
-- لأن النموذج الموحّد لجميع الكيانات يرسل عمود description دائماً،
-- بينما جدول doctors كان يحتوي bio فقط، خلافاً لبقية جداول الكيانات.

alter table public.doctors
  add column if not exists description text;
