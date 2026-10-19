-- ترحيل: دوال المنصة المطلوبة لعملية الحجز الفوري
-- 1) book_record: تسجل طلب الحجز في المنصة ويعيد معرف الربط (platform_ref)
-- 2) taken_pending_times: الأوقات المحجزة مسبقاً (طلبات معلقة) لطبيب في تاريخ
-- 3) book_record_delete: حذف سجل الحجز المؤقت عند ت Conflict

-- ===== 1) تسجل طلب الحجز في المنصة =====
create or replace function public.book_record(
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
begin
  if p_secret is distinct from 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5' then
    return null;
  end if;
  if p_doctor_id is null or coalesce(btrim(p_patient_name), '') = '' or coalesce(btrim(p_patient_phone), '') = '' then
    return null;
  end if;
  insert into public.appointment_requests
    (doctor_id, doctor_name, patient_name, patient_phone, preferred_day, preferred_time, note, requested_date, status)
  values
    (p_doctor_id, p_doctor_name, btrim(p_patient_name), btrim(p_patient_phone),
     p_preferred_day, nullif(btrim(coalesce(p_preferred_time, '')), ''),
     nullif(btrim(coalesce(p_note, '')), ''), p_requested_date, 'new')
  returning id into v_id;
  return v_id;
end;
$$;

-- ===== 2) الأوقات المحجزة مسبقاً (طلبات معلقة) =====
create or replace function public.taken_pending_times(
  p_secret text,
  p_doctor_id uuid,
  p_date date
) returns text[] language plpgsql security definer set search_path = public as $$
declare
  v_result text[];
begin
  if p_secret is distinct from 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5' then
    return array[]::text[];
  end if;
  select array_agg(coalesce(preferred_time, '')) into v_result
  from public.appointment_requests
  where doctor_id = p_doctor_id
    and status in ('new', 'confirmed')
    and coalesce(requested_date, current_date) = p_date;
  return coalesce(v_result, array[]::text[]);
end;
$$;

-- ===== 3) حذف سجل الحجز المؤقت =====
create or replace function public.book_record_delete(
  p_secret text,
  p_id uuid
) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_secret is distinct from 'brg_a8f4e2c1d6b93k75m0p2q8r4t6v1x3z5' then
    return false;
  end if;
  delete from public.appointment_requests where id = p_id;
  return true;
end;
$$;

grant execute on function public.book_record(text, uuid, text, text, text, text, text, date, text) to anon, authenticated;
grant execute on function public.taken_pending_times(text, uuid, date) to anon, authenticated;
grant execute on function public.book_record_delete(text, uuid) to anon, authenticated;