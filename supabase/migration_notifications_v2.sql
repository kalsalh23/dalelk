-- ترحيل: إصلاح وتوسيع نظام الإشعارات
-- 1) حفظ الاشتراك: أعلام (أخبار/مناوبة) لا تُمسح عند طلب موعد لاحق
-- 2) إشعار إعلان جديد (INSERT على advertisements)
-- 3) إشعار تمييز طبيب/صيدلية (عند التحول إلى مميز في الواجهة الرئيسية)
-- 4) مناوبة كل 8 ساعات عبر pg_cron (بديل كرون فيرسل المحدود بخطة Hobby)

-- ===== 1) إصلاح منطق حفظ الاشتراك: الأعلام تتراكم (OR) ولا تُصفَّر =====
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
    wants_news = public.push_subscriptions.wants_news or excluded.wants_news,
    wants_daily_duty = public.push_subscriptions.wants_daily_duty or excluded.wants_daily_duty,
    appointment_id = coalesce(excluded.appointment_id, public.push_subscriptions.appointment_id);
  return true;
end; $$;

grant execute on function public.save_push_subscription(text, text, text, boolean, boolean, uuid) to anon, authenticated;

-- ===== 2) دالة إشعار موحدة لجميع إشعارات المنصة (لمشتركي الأخبار) =====
create or replace function public.notify_platform(p_title text, p_body text, p_url text default '/')
returns void language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url := 'https://dalil-altaybeh.vercel.app/api/notify-news',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-notify-secret', '0b19a3b86555079a6a05dd6ef21a65a802719e4735a7cc68'
    ),
    body := jsonb_build_object(
      'notification', jsonb_build_object('title', p_title, 'body', p_body, 'url', p_url),
      'subscriptions', coalesce((
        select jsonb_agg(jsonb_build_object('endpoint', s.endpoint, 'keys', jsonb_build_object('p256dh', s.p256dh, 'auth', s.auth)))
        from public.push_subscriptions s where s.wants_news
      ), '[]'::jsonb)
    )
  );
end; $$;

-- ===== 3) إشعار تمييز طبيب/صيدلية (فقط عند التحول false → true) =====
create or replace function public.notify_featured_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if NEW.is_featured and not coalesce(OLD.is_featured, false) then
    if TG_TABLE_NAME = 'doctors' then
      perform public.notify_platform('طبيب مميز جديد في الواجهة الرئيسية', coalesce(NEW.name, ''), '/doctors/' || coalesce(NEW.slug, ''));
    elsif TG_TABLE_NAME = 'pharmacies' then
      perform public.notify_platform('صيدلية مميزة جديدة في الواجهة الرئيسية', coalesce(NEW.name, ''), '/pharmacies/' || coalesce(NEW.slug, ''));
    end if;
  end if;
  return NEW;
end; $$;

drop trigger if exists trg_doctors_featured on public.doctors;
create trigger trg_doctors_featured after update on public.doctors
for each row execute function notify_featured_change();

drop trigger if exists trg_pharmacies_featured on public.pharmacies;
create trigger trg_pharmacies_featured after update on public.pharmacies
for each row execute function notify_featured_change();

-- ===== 4) إشعار إعلان جديد (عند إضافة إعلان فعّال) =====
create or replace function public.notify_new_ad()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if NEW.is_active then
    perform public.notify_platform('إعلان جديد في الواجهة الرئيسية', coalesce(NEW.title, ''), '/');
  end if;
  return NEW;
end; $$;

drop trigger if exists trg_notify_new_ad on public.advertisements;
create trigger trg_notify_new_ad after insert on public.advertisements
for each row execute function notify_new_ad();

-- ===== 5) المناوبة كل 8 ساعات عبر pg_cron =====
create extension if not exists pg_cron;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'duty-push-8h') then
    perform cron.unschedule('duty-push-8h');
  end if;
end $$;

select cron.schedule(
  'duty-push-8h',
  '0 5,13,21 * * *',
  $cron$ select net.http_post(url := 'https://dalil-altaybeh.vercel.app/api/cron-daily-duty?secret=c50196c783f0cdf26fdfc592590bfbe3') $cron$
);
