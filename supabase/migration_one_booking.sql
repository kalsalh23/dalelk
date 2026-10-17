-- ترحيل: حجز نشط واحد لكل مواطن — لا يُقبل حجز ثانٍ لنفس رقم الهاتف
-- الرسالة المعروضة للمواطن: «نعتذر منك. لديك حجز سابق»
--
-- يغطي التحقق:
--   1) الحجوزات التي أنشأها المواطن من المنصة (طلبات جديدة + حجوزات مؤكدة فورية)
--   2) الحجوزات التي سجّلها الطبيب بنفسه مباشرة من العيادة (عبر /api/bridge-clinic-booking)
--
-- التطبيق: SUPABASE_MANAGEMENT_TOKEN=... SUPABASE_PROJECT_REF=... node supabase/apply-one-booking.mjs

-- ===== 1) التحقق من وجود حجز سابق لنفس رقم الهاتف =====
create or replace function public.book_check_phone(p_secret text, p_phone text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_norm text;
  v_row public.appointment_requests;
begin
  if p_secret is distinct from 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5' then
    return jsonb_build_object('error', 'unauthorized');
  end if;

  -- توحيد صيغة الرقم: أرقام فقط، بغضّ النظر عن المسافات أو +963 أو 00963
  v_norm := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  if length(v_norm) < 9 then
    return jsonb_build_object('exists', false);
  end if;
  v_norm := right(v_norm, 9);

  select * into v_row
  from public.appointment_requests
  where status in ('new', 'confirmed')            -- الحجز النشط فقط (المرفوض/المنجز لا يمنع)
    -- الطلب المعلّق يمنع دائماً؛ والمؤكد يُحتسب ما لم يمضِ تاريخه
    and (status = 'new' or requested_date is null or requested_date >= current_date)
    and right(regexp_replace(coalesce(patient_phone, ''), '\D', '', 'g'), 9) = v_norm
  order by (status = 'confirmed') desc, created_at desc
  limit 1;

  if not found then
    return jsonb_build_object('exists', false);
  end if;

  return jsonb_build_object(
    'exists', true,
    'id', v_row.id,
    'doctor', v_row.doctor_name,
    'day', v_row.preferred_day,
    -- الوقت فقط (بدون التاريخ المرفق في سجل المنصة: «11:30 — 29 سبتمبر»)
    'time', coalesce(
      (regexp_match(btrim(coalesce(v_row.preferred_time, '')), '^\d{1,2}:\d{2}'))[1],
      btrim(coalesce(v_row.preferred_time, ''))
    ),
    'date', v_row.requested_date,
    'status', v_row.status
  );
end;
$$;

grant execute on function public.book_check_phone(text, text) to anon, authenticated;

-- ===== 2) تسجيل حجز أنشأه الطبيب مباشرة من العيادة (يوصل عبر /api/bridge-clinic-booking) =====
create or replace function public.book_record_clinic(
  p_secret text,
  p_doctor_id uuid,
  p_doctor_name text,
  p_patient_name text,
  p_patient_phone text,
  p_preferred_day text,
  p_preferred_time text,
  p_requested_date date,
  p_note text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_norm text;
begin
  if p_secret is distinct from 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5' then
    return null;
  end if;
  if p_doctor_id is null or coalesce(btrim(p_patient_name), '') = '' or coalesce(btrim(p_patient_phone), '') = '' then
    return null;
  end if;

  v_norm := right(regexp_replace(coalesce(p_patient_phone, ''), '\D', '', 'g'), 9);

  -- لا تكرار لنفس المريض والموعد (نفس الطبيب + التاريخ + الوقت + الرقم)
  if exists (
    select 1 from public.appointment_requests
    where doctor_id = p_doctor_id
      and status in ('new', 'confirmed')
      and right(regexp_replace(coalesce(patient_phone, ''), '\D', '', 'g'), 9) = v_norm
      and coalesce(requested_date, 'infinity'::date) is not distinct from p_requested_date
      and btrim(coalesce(preferred_time, '')) = btrim(coalesce(p_preferred_time, ''))
  ) then
    return null;
  end if;

  insert into public.appointment_requests
    (doctor_id, doctor_name, patient_name, patient_phone, preferred_day, preferred_time, note, requested_date, status)
  values
    (p_doctor_id, p_doctor_name, btrim(p_patient_name), btrim(p_patient_phone),
     p_preferred_day, nullif(btrim(coalesce(p_preferred_time, '')), ''),
     nullif(btrim(coalesce(p_note, '')), ''), p_requested_date, 'confirmed')
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.book_record_clinic(text, uuid, text, text, text, text, text, date, text) to anon, authenticated;
