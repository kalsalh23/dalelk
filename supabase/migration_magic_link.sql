-- ترحيل: دخول الجهة عبر "رابط سحري" عشوائي خاص بكل جهة + تعزيز عشوائية كلمة السر
-- عند الموافقة على طلب الترقية يُنشأ الحساب مع:
--   - رابط لوحة تحكم فريد (magic_token) يخص الجهة نفسها فقط
--   - كلمة سر عشوائية قوية
-- كل ربط بسجل entity_accounts (خاضع لـ RLS مع حظر القراءة العامة) ويُعاد للمدير ليسلّمه للجهة.

alter table public.entity_accounts add column if not exists magic_token text;

-- إعادة بناء create_account ليولّد magic_token ويُرجع بيانات الدخول (رابط + بريد + كلمة سر)
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
  v_magic text := encode(gen_random_bytes(24), 'hex');
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
  insert into public.entity_accounts (entity_type, entity_id, slug, email, password_hash, magic_token)
  values (p_entity_type, p_entity_id, v_slug, lower(trim(p_email)), crypt(p_password, gen_salt('bf', 8)), v_magic)
  on conflict (entity_type, entity_id)
  do update set email = excluded.email, password_hash = excluded.password_hash,
                session_token = null, token_expires_at = null, magic_token = excluded.magic_token;
  return jsonb_build_object('ok', true, 'email', lower(trim(p_email)), 'slug', v_slug, 'name', v_name, 'magic_token', v_magic);
end;
$$;

-- الدخول عبر الرابط السحري → يُصدِر جلسة مؤقتة (30 يوم) للجهة صاحبة الرابط فقط
create or replace function public.entity_login_magic(p_token text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  v public.entity_accounts%rowtype;
  v_token text;
begin
  select * into v from public.entity_accounts where magic_token = p_token;
  if not found then
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

-- إعادة توليد رابط دخول جديد وحيد للجهة (يُستدعى من لوحة الإدارة فقط)
create or replace function public.entity_rotate_magic(p_entity_type text, p_entity_id uuid)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  v_magic text := encode(gen_random_bytes(24), 'hex');
begin
  if not public.is_admin(auth.uid()) then
    return null;
  end if;
  update public.entity_accounts set magic_token = v_magic, session_token = null, token_expires_at = null
  where entity_type = p_entity_type and entity_id = p_entity_id;
  if not found then
    return null;
  end if;
  return jsonb_build_object('ok', true, 'magic_token', v_magic);
end;
$$;

grant execute on function public.entity_login_magic(text) to anon, authenticated;
grant execute on function public.entity_rotate_magic(text, uuid) to authenticated;
