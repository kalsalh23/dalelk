-- ترحيل: السماح بإعادة تفعيل التجربة المجانية للطبيب عدة مرات
-- كل تفعيل جديد يمدد الباقة شهراً كاملاً من الآن وينشئ بيانات دخول جديدة للوحة
-- (كانت الدالة ترفض التكرار — الآن: التحديث بدل الرفض، مع تسجيل عدد مرات التفعيل)

create table if not exists public.entity_trials (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  plan text not null default 'pro' check (plan in ('pro','gold')),
  started_at timestamptz default now(),
  expires_at timestamptz not null,
  times_activated int not null default 1,
  unique (entity_type, entity_id)
);

-- إعادة بناء الدالة: إعادة التفعيل تمدد شهراً من الآن وتحدّث سجل التجربة
create or replace function public.start_doctor_trial(p_doctor_id uuid, p_plan text default 'pro')
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  v_name text;
  v_slug text;
  v_latin text;
  v_email text;
  v_pass text;
  v_magic text;
  v_exp timestamptz;
  v_times int;
begin
  if not public.is_admin(auth.uid()) then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  if p_plan not in ('pro','gold') then
    return jsonb_build_object('error', 'خطة غير صالحة');
  end if;

  select name, slug into v_name, v_slug from public.doctors where id = p_doctor_id;
  if v_slug is null then
    return jsonb_build_object('error', 'الطبيب غير موجود');
  end if;

  -- تسجيل التجربة: أول مرة إدراج، وإعادة التفعيل زيادة العداد وتمديد الانتهاء
  insert into public.entity_trials (entity_type, entity_id, plan, expires_at)
  values ('doctor', p_doctor_id, p_plan, now() + interval '30 days')
  on conflict (entity_type, entity_id) do update set
    plan = excluded.plan,
    started_at = now(),
    expires_at = excluded.expires_at,
    times_activated = public.entity_trials.times_activated + 1
  returning times_activated into v_times;

  -- تفعيل الباقة شهراً كاملاً من الآن (دون المساس بشارة مميّز أو غيرها)
  v_exp := now() + interval '30 days';
  update public.doctors set plan = p_plan, plan_expires_at = v_exp
  where id = p_doctor_id;

  -- إنشاء/تجديد حساب لوحة الطبيب ببريد وكلمة سر ورابط سحري جديدين
  v_latin := regexp_replace(v_slug, '[^a-z0-9.-]+', '-', 'gi');
  v_latin := regexp_replace(v_latin, '^[-]+|[-]+$', '', 'g');
  if coalesce(v_latin, '') = '' then
    v_latin := 'entity';
  end if;
  v_email := 'admin-' || v_latin || '-' || substr(replace(p_doctor_id::text, '-', ''), 1, 8) || '@gmail.com';
  v_pass := substr(encode(gen_random_bytes(12), 'base64'), 1, 12);
  v_magic := encode(gen_random_bytes(24), 'hex');

  insert into public.entity_accounts (entity_type, entity_id, slug, email, password_hash, magic_token)
  values ('doctor', p_doctor_id, v_slug, lower(v_email), crypt(v_pass, gen_salt('bf', 8)), v_magic)
  on conflict (entity_type, entity_id) do update set
    email = excluded.email,
    password_hash = excluded.password_hash,
    session_token = null,
    token_expires_at = null,
    magic_token = excluded.magic_token;

  return jsonb_build_object(
    'ok', true,
    'name', v_name,
    'slug', v_slug,
    'email', lower(v_email),
    'password', v_pass,
    'magic_token', v_magic,
    'expires_at', v_exp,
    'plan', p_plan,
    'times_activated', v_times
  );
end;
$$;

grant execute on function public.start_doctor_trial(uuid, text) to authenticated;

-- سياسة قراءة السجل للمشرفين (إن لم تكن موجودة)
alter table public.entity_trials enable row level security;
drop policy if exists "admin_read_trials" on public.entity_trials;
create policy "admin_read_trials"
on public.entity_trials for select to authenticated using (is_admin(auth.uid()));
