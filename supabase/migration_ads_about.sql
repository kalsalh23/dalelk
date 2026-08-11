-- ترحيل: جدول الإعلانات + إعدادات "من نحن"/المطوّر (تطبيق متكرر آمن)
create table if not exists public.advertisements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image text,
  link text,
  placement text default 'home',
  is_active boolean default true,
  sort_order int default 0,
  clicks bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.advertisements enable row level security;

drop policy if exists "public_read_ads" on public.advertisements;
create policy "public_read_ads" on public.advertisements for select using (is_active = true or public.is_admin(auth.uid()));
drop policy if exists "admin_insert_advertisements" on public.advertisements;
create policy "admin_insert_advertisements" on public.advertisements for insert to authenticated with check (public.is_admin(auth.uid()));
drop policy if exists "admin_update_advertisements" on public.advertisements;
create policy "admin_update_advertisements" on public.advertisements for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
drop policy if exists "admin_delete_advertisements" on public.advertisements;
create policy "admin_delete_advertisements" on public.advertisements for delete to authenticated using (public.is_admin(auth.uid()));

drop trigger if exists trg_ads_upd on public.advertisements;
create trigger trg_ads_upd before update on public.advertisements for each row execute procedure public.set_updated_at();

insert into public.app_settings (key, value)
values ('site', '{"subscriptions_enabled": false, "notification_email": "", "about": {"content": "دليلك الطبي هو دليل رقمي شامل للخدمات الطبية في مدينة طيبة الإمام، يوفر للمواطن قائمة موثّقة بالأطباء والعيادات والمشافي والصيدليات والمراكز الصحية، مع مواقعهم على الخريطة وساعات الدوام وأرقام التواصل، بالإضافة إلى نصائح طبية موثوقة وقاعدة أسئلة وأجوبة صحية.", "support_phone": "+963933000000", "support_email": "support@dalil-altaybeh.com"}, "developer": {"name": "م. قصي مهند الصالح", "title": "مطوّر المنصة", "phone": "0952639157", "international_phone": "+963952639157", "instagram": "https://www.instagram.com/kosai_al_saleh?igsh=cWM0dzEzaThqN2sz", "facebook": "https://www.facebook.com/share/17m6YZ1NKS/"}}')
on conflict (key) do update set value = excluded.value;