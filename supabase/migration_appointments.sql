-- ترحيل: نظام طلبات المواعيد (المرحلة الأولى — طلب موعد يُنشئه المواطن ويؤكده الطبيب من لوحته)
create table if not exists public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  doctor_name text,
  patient_name text not null,
  patient_phone text not null,
  preferred_day text not null,
  preferred_time text,
  note text,
  status text not null default 'new' check (status in ('new','confirmed','rejected','done')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.appointment_requests enable row level security;

-- المواطن يرسل الطلب
drop policy if exists "public_insert_appointments" on public.appointment_requests;
create policy "public_insert_appointments"
on public.appointment_requests for insert to anon, authenticated with check (true);

-- الإدارة تقرأ وتحدّث
drop policy if exists "admin_read_appointments" on public.appointment_requests;
create policy "admin_read_appointments"
on public.appointment_requests for select to authenticated using (is_admin(auth.uid()));

drop policy if exists "admin_update_appointments" on public.appointment_requests;
create policy "admin_update_appointments"
on public.appointment_requests for update to authenticated
using (is_admin(auth.uid())) with check (is_admin(auth.uid()));

drop trigger if exists trg_appointments_upd on public.appointment_requests;
create trigger trg_appointments_upd before update on public.appointment_requests
for each row execute procedure public.set_updated_at();

-- طلبات المواعيد الخاصة بالطبيب صاحب الجلسة (عبر توكن لوحة الجهة)
create or replace function public.doctor_appointments(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_doctor uuid;
begin
  select entity_id into v_doctor from public.entity_accounts
  where session_token = p_token and token_expires_at > now() and entity_type = 'doctor'
  limit 1;
  if v_doctor is null then
    return '[]'::jsonb;
  end if;
  return coalesce((
    select jsonb_agg(to_jsonb(a) order by a.created_at desc)
    from public.appointment_requests a
    where a.doctor_id = v_doctor
  ), '[]'::jsonb);
end;
$$;

-- الطبيب يحدد حالة الطلب الخاص به فقط
create or replace function public.doctor_appointment_set_status(p_token text, p_id uuid, p_status text)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_doctor uuid;
begin
  if p_status not in ('confirmed','rejected','done') then
    return false;
  end if;
  select entity_id into v_doctor from public.entity_accounts
  where session_token = p_token and token_expires_at > now() and entity_type = 'doctor'
  limit 1;
  if v_doctor is null then
    return false;
  end if;
  update public.appointment_requests set status = p_status
  where id = p_id and doctor_id = v_doctor;
  return found;
end;
$$;

grant execute on function public.doctor_appointments(text) to anon, authenticated;
grant execute on function public.doctor_appointment_set_status(text, uuid, text) to anon, authenticated;
