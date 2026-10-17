-- ترحيل: جسر مواعيد — توجيه طلبات المنصة إلى نظام إدارة العيادة (dashbord-doctor)
-- الاتجاه 1: طلب موعد جديد من المواطن → يُرسل فوراً لنظام العيادة (إن كان الطبيب مربوطاً)
-- الاتجاه 2: قبول/رفض النظام الآخر → يعود عبر /api/bridge-status → يُبلَّغ المريض بإشعاره

-- ===== 1) تاريخ الطلب المنظم (لإنشاء موعد حقيقي في نظام العيادة) =====
alter table public.appointment_requests add column if not exists requested_date date;

-- ===== 2) جدول ربط الأطباء: طبيب المنصة → عيادة نظام الإدارة =====
create table if not exists public.bridge_doctor_map (
  platform_doctor_id uuid primary key references public.doctors(id) on delete cascade,
  enabled boolean not null default true,
  created_at timestamptz default now()
);

-- ===== 3) تحديث مشغل الموعد الجديد: إشعار اللوحة + توجيه للنظام الآخر =====
create or replace function public.notify_doctor_new_appointment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  s record;
  v_day text := case NEW.preferred_day
    when 'sat' then 'السبت' when 'sun' then 'الأحد' when 'mon' then 'الاثنين'
    when 'tue' then 'الثلاثاء' when 'wed' then 'الأربعاء' when 'thu' then 'الخميس'
    when 'fri' then 'الجمعة' else coalesce(NEW.preferred_day, '') end;
  m record;
begin
  -- إشعار فوري للطبيب على لوحة المنصة (كما هو)
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

  -- توجيه الطلب لنظام إدارة العيادة (dashbord-doctor) إن كان الطبيب مربوطاً
  select * into m from public.bridge_doctor_map
  where platform_doctor_id = NEW.doctor_id and enabled limit 1;
  if found then
    perform net.http_post(
      url := 'https://dashbord-doctor.vercel.app/api/bridge-appointment',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-bridge-secret', 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5'
      ),
      body := jsonb_build_object(
        'platform_ref', NEW.id,
        'patient_name', NEW.patient_name,
        'patient_phone', NEW.patient_phone,
        'requested_date', NEW.requested_date,
        'day_label', v_day,
        'preferred_time', btrim(coalesce(NEW.preferred_time, '')),
        'note', NEW.note,
        'source', 'dalil-altaybeh'
      )
    );
  end if;
  return NEW;
end; $$;

-- ===== 4) دوال قبول/رفض قادمة من النظام الآخر (تُستدعى من /api/bridge-status) =====
create or replace function public.bridge_update_status(p_secret text, p_platform_ref uuid, p_status text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_mapped text;
  v_appt record;
begin
  if p_secret is distinct from 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5' then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  v_mapped := case p_status
    when 'confirmed' then 'confirmed'
    when 'cancelled' then 'rejected'
    when 'completed' then 'done'
    else null end;
  if v_mapped is null then
    return jsonb_build_object('ok', true, 'ignored', p_status);
  end if;
  update public.appointment_requests set status = v_mapped, updated_at = now()
  where id = p_platform_ref;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'الطلب غير موجود');
  end if;
  select * into v_appt from public.appointment_requests where id = p_platform_ref;
  return jsonb_build_object('ok', true, 'status', v_mapped, 'patient_name', v_appt.patient_name);
end; $$;

grant execute on function public.bridge_update_status(text, uuid, text) to anon, authenticated;
