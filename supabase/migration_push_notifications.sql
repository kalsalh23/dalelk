-- ترحيل: نظام الإشعارات الخارجية (Web Push)
-- الاشتراكات + دوال الإرسال عبر pg_net إلى دوال Vercel الخادمية
create extension if not exists pg_net;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  wants_news boolean not null default false,
  wants_daily_duty boolean not null default false,
  appointment_id uuid,
  created_at timestamptz default now()
);
alter table public.push_subscriptions enable row level security;
-- لا سياسات عامة: الحفظ عبر save_push_subscription (security definer) والقراءة داخل دوال الإرسال فقط

-- حفظ/تحديث اشتراك متصفح
create or replace function public.save_push_subscription(
  p_endpoint text, p_p256dh text, p_auth text,
  p_wants_news boolean default false, p_wants_daily_duty boolean default false,
  p_appointment_id uuid default null
) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if coalesce(p_endpoint, '') = '' or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    return false;
  end if;
  insert into public.push_subscriptions (endpoint, p256dh, auth, wants_news, wants_daily_duty, appointment_id)
  values (p_endpoint, p_p256dh, p_auth, coalesce(p_wants_news, false), coalesce(p_wants_daily_duty, false), p_appointment_id)
  on conflict (endpoint) do update set
    p256dh = excluded.p256dh,
    auth = excluded.auth,
    wants_news = excluded.wants_news,
    wants_daily_duty = excluded.wants_daily_duty,
    appointment_id = coalesce(excluded.appointment_id, public.push_subscriptions.appointment_id);
  return true;
end; $$;
grant execute on function public.save_push_subscription(text, text, text, boolean, boolean, uuid) to anon, authenticated;

-- حمولة الإشعار اليومي للصيدليات المناوبة (يستدعيها cron Vercel مع السر)
-- ملاحظة: استبدل <NOTIFY_SECRET> بالقيمة الفعلية عند التطبيق على بيئة جديدة
create or replace function public.daily_duty_payload(p_secret text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if p_secret is distinct from '<NOTIFY_SECRET>' then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  return jsonb_build_object(
    'notification', jsonb_build_object(
      'title', 'صيدليات المناوبة اليوم',
      'body', coalesce((
        select string_agg(p.name, ' — ')
        from public.duty_pharmacies dp join public.pharmacies p on p.id = dp.pharmacy_id
        where dp.is_active and current_date between dp.start_date and dp.end_date
      ), 'لا توجد صيدليات مناوبة مسجلة اليوم'),
      'url', '/duty-pharmacies'
    ),
    'subscriptions', coalesce((
      select jsonb_agg(jsonb_build_object('endpoint', s.endpoint, 'keys', jsonb_build_object('p256dh', s.p256dh, 'auth', s.auth)))
      from public.push_subscriptions s where s.wants_daily_duty
    ), '[]'::jsonb)
  );
end; $$;
grant execute on function public.daily_duty_payload(text) to anon, authenticated;
