-- ترحيل: ميزات الطبيب المشترك — إحصائيات + إشعار موعد جديد + وضع الإجازة
-- (رمز QR واجهة واجهة أمامية فقط بلا تغييرات قاعدة)

-- ===== 1) وضع الإجازة =====
alter table public.doctors add column if not exists vacation_until date;

create or replace function public.doctor_set_vacation(p_token text, p_until date)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_doctor uuid;
begin
  if p_token is null or p_token = '' then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  select entity_id into v_doctor from public.entity_accounts
  where session_token = p_token and token_expires_at > now() and entity_type = 'doctor'
  limit 1;
  if v_doctor is null then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  if p_until is not null and p_until < current_date then
    return jsonb_build_object('error', 'التاريخ يجب أن يكون اليوم أو بعده');
  end if;
  update public.doctors set vacation_until = p_until where id = v_doctor;
  return jsonb_build_object('ok', true, 'vacation_until', p_until);
end; $$;

-- ===== 2) اشتراكات دفع الجهات (لإشعار الطبيب بالمواعيد الجديدة) =====
create table if not exists public.entity_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);
alter table public.entity_push_subscriptions enable row level security;

create or replace function public.entity_push_register(p_token text, p_endpoint text, p_p256dh text, p_auth text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_type text;
begin
  if p_token is null or p_token = '' then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  select entity_id, entity_type into v_id, v_type from public.entity_accounts
  where session_token = p_token and token_expires_at > now()
  limit 1;
  if v_id is null then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  if coalesce(p_endpoint, '') = '' or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    return jsonb_build_object('error', 'بيانات الاشتراك ناقصة');
  end if;
  insert into public.entity_push_subscriptions (entity_type, entity_id, endpoint, p256dh, auth)
  values (v_type, v_id, p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update set
    entity_type = excluded.entity_type,
    entity_id = excluded.entity_id,
    p256dh = excluded.p256dh,
    auth = excluded.auth;
  return jsonb_build_object('ok', true);
end; $$;

create or replace function public.entity_push_unregister(p_token text, p_endpoint text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  select entity_id into v_id from public.entity_accounts
  where session_token = p_token and token_expires_at > now()
  limit 1;
  if v_id is null then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  delete from public.entity_push_subscriptions
  where entity_id = v_id and endpoint = p_endpoint;
  return jsonb_build_object('ok', true);
end; $$;

-- ===== 3) مشغل: إشعار الطبيب الفوري عند طلب موعد جديد =====
create or replace function public.notify_doctor_new_appointment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  s record;
  v_day text := case NEW.preferred_day
    when 'sat' then 'السبت' when 'sun' then 'الأحد' when 'mon' then 'الاثنين'
    when 'tue' then 'الثلاثاء' when 'wed' then 'الأربعاء' when 'thu' then 'الخميس'
    when 'fri' then 'الجمعة' else coalesce(NEW.preferred_day, '') end;
begin
  for s in select endpoint, p256dh, auth from public.entity_push_subscriptions
           where entity_type = 'doctor' and entity_id = NEW.doctor_id
  loop
    perform net.http_post(
      url := 'https://dalil-altaybeh.vercel.app/api/notify-appointment',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-notify-secret', '0b19a3b86555079a6a05dd6ef21a65a802719e4735a7cc68'
      ),
      body := jsonb_build_object(
        'subscription', jsonb_build_object('endpoint', s.endpoint, 'keys', jsonb_build_object('p256dh', s.p256dh, 'auth', s.auth)),
        'notification', jsonb_build_object(
          'title', 'طلب موعد جديد 🗓️',
          'body', 'من ' || NEW.patient_name || ' — ' || v_day || coalesce(' ' || btrim(NEW.preferred_time), ''),
          'url', '/dashboard/appointments'
        )
      )
    );
  end loop;
  return NEW;
end; $$;

drop trigger if exists trg_appointment_new on public.appointment_requests;
create trigger trg_appointment_new after insert on public.appointment_requests
for each row execute function notify_doctor_new_appointment();

-- ===== 4) إحصائيات الجهة في لوحتها =====
create or replace function public.doctor_stats(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_entity_id uuid;
  v_entity_type text;
  v_tbl text;
  v_views int := 0;
  v_phone int := 0;
  v_wa int := 0;
  v_map int := 0;
  v_share int := 0;
  v_prof int := 0;
  v_appt_total int := 0;
  v_appt_new int := 0;
  v_vac date;
  v_trend jsonb;
begin
  if p_token is null or p_token = '' then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  select entity_id, entity_type into v_entity_id, v_entity_type from public.entity_accounts
  where session_token = p_token and token_expires_at > now()
  limit 1;
  if v_entity_id is null then
    return jsonb_build_object('error', 'unauthorized');
  end if;

  v_tbl := case v_entity_type
    when 'health_center' then 'health_centers'
    when 'radiology' then 'radiology_centers'
    else v_entity_type || 's' end;

  begin
    execute format('select coalesce(view_count, 0) from public.%I where id = $1', v_tbl) into v_views using v_entity_id;
  exception when others then
    v_views := 0;
  end;

  select count(*) filter (where event_type = 'phone_click'),
         count(*) filter (where event_type = 'whatsapp_click'),
         count(*) filter (where event_type = 'map_click'),
         count(*) filter (where event_type = 'share'),
         count(*) filter (where event_type = 'profile_view')
  into v_phone, v_wa, v_map, v_share, v_prof
  from public.statistics
  where entity_id = v_entity_id;

  if v_entity_type = 'doctor' then
    select count(*), count(*) filter (where status = 'new')
    into v_appt_total, v_appt_new
    from public.appointment_requests where doctor_id = v_entity_id;
    select vacation_until into v_vac from public.doctors where id = v_entity_id;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('day', d, 'count', c) order by d), '[]'::jsonb)
  into v_trend
  from (
    select to_char(created_at::date, 'YYYY-MM-DD') as d, count(*) as c
    from public.statistics
    where entity_id = v_entity_id and event_type = 'profile_view'
      and created_at >= now() - interval '14 days'
    group by 1
  ) t;

  return jsonb_build_object(
    'ok', true,
    'entity_type', v_entity_type,
    'view_count', v_views,
    'phone_clicks', v_phone,
    'whatsapp_clicks', v_wa,
    'map_clicks', v_map,
    'shares', v_share,
    'profile_views', v_prof,
    'appointments_total', v_appt_total,
    'appointments_new', v_appt_new,
    'vacation_until', v_vac,
    'trend', v_trend
  );
end; $$;

grant execute on function public.doctor_set_vacation(text, date) to anon, authenticated;
grant execute on function public.entity_push_register(text, text, text, text) to anon, authenticated;
grant execute on function public.entity_push_unregister(text, text) to anon, authenticated;
grant execute on function public.doctor_stats(text) to anon, authenticated;
