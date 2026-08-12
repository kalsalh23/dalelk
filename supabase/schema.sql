-- =====================================================
-- دليلك الطبي — مخطط قاعدة البيانات الكامل
-- الإصدار 1.0
-- =====================================================

-- المساعدة: gen_random_uuid()
create extension if not exists "pgcrypto";

-- ---------- المدن (دعم مستقبلي) ----------
create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  lat double precision,
  lng double precision,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- التصنيفات (الاختصاصات / تصنيفات المقالات) ----------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null default 'specialty', -- specialty | article
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------- الأطباء ----------
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  name text not null,
  slug text not null unique,
  specialty text,
  specialty_category_id uuid references public.categories(id) on delete set null,
  gender text check (gender in ('male','female')) default null,
  bio text,
  experience_years int,
  certifications text[] default '{}',
  services text[] default '{}',
  work_hours jsonb,
  phone text,
  whatsapp text,
  address text,
  lat double precision,
  lng double precision,
  image text,
  images text[] default '{}',
  gallery text[] default '{}',
  video_url text,
  rating numeric(2,1),
  is_verified boolean default false,
  is_featured boolean not null default false,
  is_active boolean default true,
  plan text default 'free' check (plan in ('free','pro','gold')),
  plan_expires_at timestamptz,
  seo_title text,
  seo_description text,
  view_count bigint default 0,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- العيادات ----------
create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  name text not null,
  slug text not null unique,
  specialty text,
  description text,
  services text[] default '{}',
  work_hours jsonb,
  phone text,
  whatsapp text,
  address text,
  lat double precision,
  lng double precision,
  image text,
  images text[] default '{}',
  gallery text[] default '{}',
  is_verified boolean default false,
  is_active boolean default true,
  plan text default 'free' check (plan in ('free','pro','gold')),
  plan_expires_at timestamptz,
  seo_title text,
  seo_description text,
  view_count bigint default 0,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- المشافي ----------
create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  departments text[] default '{}',
  services text[] default '{}',
  work_hours jsonb,
  phone text,
  emergency_phone text,
  whatsapp text,
  address text,
  lat double precision,
  lng double precision,
  image text,
  images text[] default '{}',
  is_verified boolean default false,
  is_active boolean default true,
  plan text default 'free' check (plan in ('free','pro','gold')),
  plan_expires_at timestamptz,
  seo_title text,
  seo_description text,
  view_count bigint default 0,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- المراكز الصحية ----------
create table if not exists public.health_centers (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  departments text[] default '{}',
  services text[] default '{}',
  work_hours jsonb,
  phone text,
  whatsapp text,
  address text,
  lat double precision,
  lng double precision,
  image text,
  images text[] default '{}',
  is_verified boolean default false,
  is_active boolean default true,
  plan text default 'free' check (plan in ('free','pro','gold')),
  plan_expires_at timestamptz,
  seo_title text,
  seo_description text,
  view_count bigint default 0,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- الصيدليات ----------
create table if not exists public.pharmacies (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  services text[] default '{}',
  opening_hours text,
  phone text,
  whatsapp text,
  address text,
  lat double precision,
  lng double precision,
  image text,
  images text[] default '{}',
  is_verified boolean default false,
  is_active boolean default true,
  plan text default 'free' check (plan in ('free','pro','gold')),
  plan_expires_at timestamptz,
  seo_title text,
  seo_description text,
  view_count bigint default 0,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- الصيدليات المناوبة ----------
create table if not exists public.duty_pharmacies (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid references public.pharmacies(id) on delete cascade,
  city_id uuid references public.cities(id) on delete set null,
  start_date date not null,
  end_date date not null,
  duty_hours text,
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- المخابر ----------
create table if not exists public.labs (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  services text[] default '{}',
  tests text[] default '{}',
  opening_hours text,
  phone text,
  whatsapp text,
  address text,
  lat double precision,
  lng double precision,
  image text,
  images text[] default '{}',
  is_verified boolean default false,
  is_active boolean default true,
  plan text default 'free' check (plan in ('free','pro','gold')),
  plan_expires_at timestamptz,
  seo_title text,
  seo_description text,
  view_count bigint default 0,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- مراكز الأشعة ----------
create table if not exists public.radiology_centers (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references public.cities(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  services text[] default '{}',
  machines text[] default '{}',
  opening_hours text,
  phone text,
  whatsapp text,
  address text,
  lat double precision,
  lng double precision,
  image text,
  images text[] default '{}',
  is_verified boolean default false,
  is_active boolean default true,
  plan text default 'free' check (plan in ('free','pro','gold')),
  plan_expires_at timestamptz,
  seo_title text,
  seo_description text,
  view_count bigint default 0,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- المقالات (النصائح الطبية) ----------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  image text,
  excerpt text,
  content text not null default '',
  is_published boolean default false,
  is_featured boolean default false,
  published_at timestamptz,
  view_count bigint default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- الأخبار ----------
create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  image text,
  excerpt text,
  content text not null default '',
  is_published boolean default false,
  published_at timestamptz,
  view_count bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- قاعدة المعرفة الطبية ----------
create table if not exists public.medical_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category_id uuid references public.categories(id) on delete set null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.medical_keywords (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.medical_questions(id) on delete cascade,
  keyword text not null
);
create index if not exists idx_medical_keywords_question on public.medical_keywords(question_id);
create index if not exists idx_medical_keywords_keyword on public.medical_keywords(keyword);

-- ---------- أسئلة غير مجاب عنها ----------
create table if not exists public.unanswered_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  created_at timestamptz default now(),
  status text default 'pending' check (status in ('pending','answered','ignored'))
);

-- ---------- طلبات الترقية ----------
create table if not exists public.subscription_requests (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null,
  entity_type text not null check (entity_type in ('doctor','clinic','hospital','health_center','pharmacy','lab','radiology')),
  current_plan text default 'free' check (current_plan in ('free','pro','gold')),
  requested_plan text default 'pro' check (requested_plan in ('free','pro','gold')),
  phone text,
  notes text,
  status text default 'new' check (status in ('new','contacting','awaiting_payment','approved','rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- الإحصائيات ----------
create table if not exists public.statistics (
  id uuid primary key default gen_random_uuid(),
  event_type text not null, -- page_view | search | phone_click | whatsapp_click | map_click | profile_view
  entity_type text,
  entity_id uuid,
  path text,
  created_at timestamptz default now()
);
create index if not exists idx_statistics_event on public.statistics(event_type, created_at);
create index if not exists idx_statistics_path on public.statistics(path);

-- ---------- الإعلانات ----------
create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image text,
  link text,
  placement text default 'home', -- home | about
  is_active boolean default true,
  sort_order int default 0,
  clicks bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- إعدادات المنصة ----------
create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb,
  updated_at timestamptz default now()
);

-- ---------- بروفايلات المستخدمين (إدارية) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- =====================================================
-- الدوال
-- =====================================================

-- التحقق من كون المستخدم مسؤولاً
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

-- زيادة عدد المشاهدات (دالة آمنة محصّنة بجدول أبيض)
create or replace function public.increment_view_count(table_name text, row_id uuid)
returns void language plpgsql security definer as $$
declare
  allowed text[] := array['doctors','clinics','hospitals','health_centers','pharmacies','labs','radiology_centers','articles','news_items'];
begin
  if table_name = any(allowed) then
    execute format('update public.%I set view_count = view_count + 1 where id = $1', table_name) using row_id;
  end if;
end;
$$;

-- تحديث updated_at تلقائياً
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_doctors_upd on public.doctors;
create trigger trg_doctors_upd before update on public.doctors for each row execute procedure public.set_updated_at();
drop trigger if exists trg_clinics_upd on public.clinics;
create trigger trg_clinics_upd before update on public.clinics for each row execute procedure public.set_updated_at();
drop trigger if exists trg_hospitals_upd on public.hospitals;
create trigger trg_hospitals_upd before update on public.hospitals for each row execute procedure public.set_updated_at();
drop trigger if exists trg_health_upd on public.health_centers;
create trigger trg_health_upd before update on public.health_centers for each row execute procedure public.set_updated_at();
drop trigger if exists trg_pharm_upd on public.pharmacies;
create trigger trg_pharm_upd before update on public.pharmacies for each row execute procedure public.set_updated_at();
drop trigger if exists trg_labs_upd on public.labs;
create trigger trg_labs_upd before update on public.labs for each row execute procedure public.set_updated_at();
drop trigger if exists trg_rad_upd on public.radiology_centers;
create trigger trg_rad_upd before update on public.radiology_centers for each row execute procedure public.set_updated_at();
drop trigger if exists trg_articles_upd on public.articles;
create trigger trg_articles_upd before update on public.articles for each row execute procedure public.set_updated_at();
drop trigger if exists trg_questions_upd on public.medical_questions;
create trigger trg_questions_upd before update on public.medical_questions for each row execute procedure public.set_updated_at();
drop trigger if exists trg_req_upd on public.subscription_requests;
create trigger trg_req_upd before update on public.subscription_requests for each row execute procedure public.set_updated_at();
drop trigger if exists trg_duty_upd on public.duty_pharmacies;
create trigger trg_duty_upd before update on public.duty_pharmacies for each row execute procedure public.set_updated_at();
drop trigger if exists trg_ads_upd on public.advertisements;
create trigger trg_ads_upd before update on public.advertisements for each row execute procedure public.set_updated_at();

-- =====================================================
-- Row Level Security
-- =====================================================
alter table public.cities enable row level security;
alter table public.categories enable row level security;
alter table public.doctors enable row level security;
alter table public.clinics enable row level security;
alter table public.hospitals enable row level security;
alter table public.health_centers enable row level security;
alter table public.pharmacies enable row level security;
alter table public.duty_pharmacies enable row level security;
alter table public.advertisements enable row level security;
alter table public.labs enable row level security;
alter table public.radiology_centers enable row level security;
alter table public.articles enable row level security;
alter table public.news_items enable row level security;
alter table public.medical_questions enable row level security;
alter table public.medical_keywords enable row level security;
alter table public.unanswered_questions enable row level security;
alter table public.subscription_requests enable row level security;
alter table public.statistics enable row level security;
alter table public.app_settings enable row level security;
alter table public.profiles enable row level security;

-- القراءة العامة
create policy "public_read_cities" on public.cities for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_categories" on public.categories for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_doctors" on public.doctors for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_clinics" on public.clinics for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_hospitals" on public.hospitals for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_health" on public.health_centers for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_pharmacies" on public.pharmacies for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_duty" on public.duty_pharmacies for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_ads" on public.advertisements for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_labs" on public.labs for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_radiology" on public.radiology_centers for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_articles" on public.articles for select using (is_published = true or is_admin(auth.uid()));
create policy "public_read_news" on public.news_items for select using (is_published = true or is_admin(auth.uid()));
create policy "public_read_questions" on public.medical_questions for select using (is_active = true or is_admin(auth.uid()));
create policy "public_read_keywords" on public.medical_keywords for select using (true);
create policy "public_read_unanswered" on public.unanswered_questions for select using (is_admin(auth.uid()));
create policy "public_read_requests" on public.subscription_requests for select using (is_admin(auth.uid()));
create policy "public_read_stats" on public.statistics for select using (is_admin(auth.uid()));
create policy "public_read_settings" on public.app_settings for select using (true);
create policy "public_read_profiles" on public.profiles for select using (true);

-- الكتابة: المسؤول فقط
do $$
declare t text;
begin
  foreach t in array array['cities','categories','doctors','clinics','hospitals','health_centers','pharmacies','duty_pharmacies','labs','radiology_centers','articles','news_items','medical_questions','medical_keywords','unanswered_questions','subscription_requests','app_settings','advertisements'] loop
    execute format('create policy "admin_insert_%s" on public.%I for insert to authenticated with check (is_admin(auth.uid()));', t, t);
    execute format('create policy "admin_update_%s" on public.%I for update to authenticated using (is_admin(auth.uid())) with check (is_admin(auth.uid()));', t, t);
    execute format('create policy "admin_delete_%s" on public.%I for delete to authenticated using (is_admin(auth.uid()));', t, t);
  end loop;
end $$;

-- الإحصائيات: كتابة عامة (تسجيل الأحداث)
create policy "public_insert_stats" on public.statistics for insert to anon, authenticated with check (true);

-- الأسئلة غير المجاب عنها: يكتبها الزوار
create policy "public_insert_unanswered" on public.unanswered_questions for insert to anon, authenticated with check (true);

-- طلبات الترقية: يكتبها الزوار مستقبلاً (مفعّلة بعد تفعيل الاشتراكات)
create policy "public_insert_requests" on public.subscription_requests for insert to anon, authenticated with check (true);

-- البروفايلات: يُنشئ المستخدم ملفه عند التسجيل
create policy "profiles_insert_self" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- =====================================================
-- إعدادات افتراضية
-- =====================================================
insert into public.app_settings (key, value)
values ('site', '{"subscriptions_enabled": false, "notification_email": "", "about": {"content": "دليلك الطبي هو دليل رقمي شامل للخدمات الطبية في مدينة طيبة الإمام، يوفر للمواطن قائمة موثّقة بالأطباء والعيادات والمشافي والصيدليات والمراكز الصحية، مع مواقعهم على الخريطة وساعات الدوام وأرقام التواصل، بالإضافة إلى نصائح طبية موثوقة وقاعدة أسئلة وأجوبة صحية.", "support_phone": "+963933000000", "support_email": "support@dalil-altaybeh.com"}, "developer": {"name": "م. قصي مهند الصالح", "title": "مطوّر المنصة", "phone": "0952639157", "international_phone": "+963952639157", "instagram": "https://www.instagram.com/kosai_al_saleh?igsh=cWM0dzEzaThqN2sz", "facebook": "https://www.facebook.com/share/17m6YZ1NKS/"}}')
on conflict (key) do nothing;

-- المدينة الرئيسية
insert into public.cities (name, slug, lat, lng)
values ('طيبة الإمام', 'taybet-al-imam', 35.26389, 36.70667)
on conflict (slug) do nothing;

-- تصنيفات المقالات
insert into public.categories (name, slug, type, sort_order) values
('الأطفال','kids','article',1),
('المرأة','women','article',2),
('التغذية','nutrition','article',3),
('القلب','heart','article',4),
('السكري','diabetes','article',5),
('الضغط','hypertension','article',6),
('الصحة النفسية','mental-health','article',7),
('الرياضة','sports','article',8),
('الوقاية','prevention','article',9),
('الأدوية','medications','article',10),
('الإسعافات الأولية','first-aid','article',11)
on conflict (slug) do nothing;

grant execute on function public.is_admin(uuid) to anon, authenticated;
grant execute on function public.increment_view_count(text, uuid) to anon, authenticated;