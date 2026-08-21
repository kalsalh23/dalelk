-- ترحيل: لوحة تحكم الجهات الموسّعة
-- 1) توسيع entity_update_own ليشمل الصور والإحداثيات وجميع الحقول القابلة للتحرير
-- 2) السماح للجهات برفع الصور إلى bucket medical عبر anon (لأن حسابات الجهات ليست auth.users)

-- تحديث دالة التعديل الذاتي بقائمة بيضاء موسعة + معالجة أنواع أعمدة إضافية
create or replace function public.entity_update_own(p_token text, p_fields jsonb)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare
  v public.entity_accounts%rowtype;
  v_table text;
  v_whitelist text[] := array[
    'name','phone','whatsapp','address','lat','lng',
    'image','images','gallery',
    'specialty','bio','description',
    'services','work_hours','opening_hours',
    'video_url','instagram','facebook',
    'experience_years','certifications',
    'departments','tests','machines','emergency_phone',
    'rating'
  ];
  v_key text;
  v_val jsonb;
  v_set text := '';
  v_expr text;
begin
  select * into v from public.entity_accounts where session_token = p_token and token_expires_at > now();
  if not found then return false; end if;
  v_table := case v.entity_type
    when 'doctor' then 'doctors' when 'clinic' then 'clinics' when 'hospital' then 'hospitals'
    when 'health_center' then 'health_centers' when 'pharmacy' then 'pharmacies'
    when 'lab' then 'labs' when 'radiology' then 'radiology_centers' end;
  if v_table is null then return false; end if;
  for v_key, v_val in select * from jsonb_each(p_fields) loop
    if v_key = any(v_whitelist)
       and exists (
         select 1 from information_schema.columns
         where table_schema = 'public' and table_name = v_table and column_name = v_key
       ) then
      if v_key in ('work_hours') then
        -- jsonb مباشر
        if v_val is null or v_val::text = 'null' then
          v_expr := format(', %I = null', v_key);
        else
          v_expr := format(', %I = %L::jsonb', v_key, v_val::text);
        end if;
      elsif v_key in ('services','certifications','departments','tests','machines','images','gallery') then
        if jsonb_typeof(v_val) = 'array' then
          v_expr := format(', %I = (select coalesce(array_agg(x), array[]::text[]) from jsonb_array_elements_text(%L::jsonb) x)', v_key, v_val::text);
        elsif v_val is null or v_val::text = 'null' then
          v_expr := format(', %I = null', v_key);
        else
          v_expr := format(', %I = string_to_array(%L, '','')', v_key, v_val#>>'{}');
        end if;
      elsif v_key in ('experience_years') then
        v_expr := format(', %I = nullif(%L, '''')::int', v_key, v_val#>>'{}');
      elsif v_key in ('lat','lng','rating') then
        v_expr := format(', %I = nullif(%L, '''')::double precision', v_key, v_val#>>'{}');
      elsif v_key in ('opening_hours') then
        -- text أو json حسب الجدول
        v_expr := format(', %I = %L', v_key, v_val#>>'{}');
      else
        if v_val is null or v_val::text = 'null' then
          v_expr := format(', %I = null', v_key);
        else
          v_expr := format(', %I = %L', v_key, v_val#>>'{}');
        end if;
      end if;
      v_set := v_set || v_expr;
    end if;
  end loop;
  if v_set = '' then return false; end if;
  execute format('update public.%I set %s where id = $1', v_table, ltrim(v_set, ',')) using v.entity_id;
  return true;
end;
$$;

grant execute on function public.entity_update_own(text, jsonb) to anon, authenticated;

-- السماح برفع الصور للجهات (حسابات entity_accounts ليست ضمن auth.users لذا نسمح لـ anon)
-- ملاحظة: القراءة عامة أصلاً، نضيف سياسات كتابة للـ anon + authenticated غير المشروط بـ is_admin
drop policy if exists "entity_insert_medical_objects" on storage.objects;
create policy "entity_insert_medical_objects"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'medical');

drop policy if exists "entity_update_medical_objects" on storage.objects;
create policy "entity_update_medical_objects"
on storage.objects for update to anon, authenticated
using (bucket_id = 'medical')
with check (bucket_id = 'medical');

drop policy if exists "entity_delete_medical_objects" on storage.objects;
create policy "entity_delete_medical_objects"
on storage.objects for delete to anon, authenticated
using (bucket_id = 'medical');
