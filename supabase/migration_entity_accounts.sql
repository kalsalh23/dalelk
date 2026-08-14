-- ترحيل: حسابات الجهات (الأطباء/العيادات/المخابر...) للوحة تحكم خاصة بكل جهة
-- عند الموافقة على طلب ترقية يُنشأ حساب تلقائياً: البريد admin-<slug>@gmail.com
-- وكلمة سر فريدة على القاعدة dalil@2026<رقم>

create extension if not exists pgcrypto;

create table if not exists public.entity_accounts (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  slug text not null,
  email text not null unique,
  password_hash text not null,
  session_token text,
  token_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (entity_type, entity_id)
);

alter table public.entity_accounts enable row level security;

-- لا قراءة عامة إطلاقاً — الوصول عبر الدوال المؤمّنة فقط
create policy "entity_accounts_no_read" on public.entity_accounts for select using (false);

-- =====================================================
-- إنشاء حساب جهة (من لوحة التحكم فقط: is_admin)
-- p_password تمرر كنص؛ تُخزّن hashed فقط وتُعاد النتيجة للمدير
-- =====================================================
create or replace function public.entity_create_account(
  p_entity_type text,
  p_entity_id uuid,
  p_email text,
  p_password text
) returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  v_slug text;
  v_name text;
  v_table text := case p_entity_type
    when 'doctor' then 'doctors' when 'clinic' then 'clinics' when 'hospital' then 'hospitals'
    when 'health_center' then 'health_centers' when 'pharmacy' then 'pharmacies'
    when 'lab' then 'labs' when 'radiology' then 'radiology_centers' end;
begin
  if not public.is_admin(auth.uid()) then
    return null;
  end if;
  if v_table is null then
    return jsonb_build_object('error', 'نوع جهة غير صالح');
  end if;
  execute format('select slug, name from public.%I where id = $1', v_table) into v_slug, v_name using p_entity_id;
  if v_slug is null then
    return jsonb_build_object('error', 'الجهة غير موجودة');
  end if;
  insert into public.entity_accounts (entity_type, entity_id, slug, email, password_hash)
  values (p_entity_type, p_entity_id, v_slug, lower(trim(p_email)), crypt(p_password, gen_salt('bf', 8)))
  on conflict (entity_type, entity_id)
  do update set email = excluded.email, password_hash = excluded.password_hash, session_token = null, token_expires_at = null;
  return jsonb_build_object('ok', true, 'email', lower(trim(p_email)), 'slug', v_slug, 'name', v_name);
end;
$$;

-- =====================================================
-- دخول جهة بالبريد وكلمة السر → يردّ جلسة مؤقتة
-- =====================================================
create or replace function public.entity_login(p_email text, p_password text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  v public.entity_accounts%rowtype;
  v_token text;
begin
  select * into v from public.entity_accounts where email = lower(trim(p_email));
  if not found or v.password_hash is distinct from crypt(p_password, v.password_hash) then
    return null;
  end if;
  v_token := encode(gen_random_bytes(24), 'hex');
  update public.entity_accounts set session_token = v_token, token_expires_at = now() + interval '30 days'
  where id = v.id;
  return jsonb_build_object(
    'id', v.id, 'entity_type', v.entity_type, 'entity_id', v.entity_id,
    'slug', v.slug, 'email', v.email, 'session_token', v_token
  );
end;
$$;

-- =====================================================
-- جلب بيانات الجهة لجلسة نشطة (تُستخدم في لوحة الجهة)
-- =====================================================
create or replace function public.entity_session(p_token text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  v public.entity_accounts%rowtype;
  v_table text;
  v_entity jsonb;
begin
  select * into v from public.entity_accounts where session_token = p_token and token_expires_at > now();
  if not found then
    return null;
  end if;
  v_table := case v.entity_type
    when 'doctor' then 'doctors' when 'clinic' then 'clinics' when 'hospital' then 'hospitals'
    when 'health_center' then 'health_centers' when 'pharmacy' then 'pharmacies'
    when 'lab' then 'labs' when 'radiology' then 'radiology_centers' end;
  if v_table is not null then
    execute format('select to_jsonb(t) from public.%I t where id = $1', v_table) into v_entity using v.entity_id;
  end if;
  return jsonb_build_object(
    'id', v.id, 'entity_type', v.entity_type, 'entity_id', v.entity_id,
    'slug', v.slug, 'email', v.email, 'entity', v_entity
  );
end;
$$;

-- =====================================================
-- تحديث بيانات الجهة من لوحتها (جلسة نشطة، قائمة بيضاء للحقول)
-- =====================================================
create or replace function public.entity_update_own(p_token text, p_fields jsonb)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare
  v public.entity_accounts%rowtype;
  v_table text;
  v_whitelist text[] := array['name','phone','whatsapp','address','specialty','bio','description','services','work_hours','opening_hours','video_url','instagram','facebook','experience_years'];
  v_key text;
  v_val jsonb;
  v_set text := '';
  v_expr text;
begin
  select * into v from public.entity_accounts where session_token = p_token and token_expires_at > now();
  if not found then
    return false;
  end if;
  v_table := case v.entity_type
    when 'doctor' then 'doctors' when 'clinic' then 'clinics' when 'hospital' then 'hospitals'
    when 'health_center' then 'health_centers' when 'pharmacy' then 'pharmacies'
    when 'lab' then 'labs' when 'radiology' then 'radiology_centers' end;
  if v_table is null then
    return false;
  end if;
  for v_key, v_val in select * from jsonb_each(p_fields) loop
    if v_key = any(v_whitelist)
       and exists (
         select 1 from information_schema.columns
         where table_schema = 'public' and table_name = v_table and column_name = v_key
       ) then
      if v_key in ('work_hours', 'opening_hours') then
        v_expr := format(', %I = %L::jsonb', v_key, v_val#>>'{}');
      elsif v_key = 'services' then
        if jsonb_typeof(v_val) = 'array' then
          v_expr := format(', %I = (select coalesce(array_agg(x), array[]::text[]) from jsonb_array_elements_text(%L::jsonb) x)', v_key, v_val);
        else
          v_expr := format(', %I = %L::text[]', v_key, v_val#>>'{}');
        end if;
      elsif v_key = 'experience_years' then
        v_expr := format(', %I = nullif(%L, '''')::int', v_key, v_val#>>'{}');
      else
        v_expr := format(', %I = %L', v_key, v_val#>>'{}');
      end if;
      v_set := v_set || v_expr;
    end if;
  end loop;
  if v_set = '' then
    return false;
  end if;
  execute format('update public.%I set %s where id = $1', v_table, ltrim(v_set, ',')) using v.entity_id;
  return true;
end;
$$;

grant execute on function public.entity_create_account(text, uuid, text, text) to authenticated;
grant execute on function public.entity_login(text, text) to anon, authenticated;
grant execute on function public.entity_session(text) to anon, authenticated;
grant execute on function public.entity_update_own(text, jsonb) to anon, authenticated;
