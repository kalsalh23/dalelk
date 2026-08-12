-- ترحيل: عمود is_featured للأطباء المميزين (تطبيق متكرر آمن)
alter table public.doctors add column if not exists is_featured boolean not null default false;

create index if not exists idx_doctors_featured on public.doctors(is_featured) where is_featured = true;