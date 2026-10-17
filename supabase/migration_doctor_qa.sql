-- ترحيل: «اكتب سؤالك» — أسئلة وأجوبة يضيفها الطبيب ضمن جدول اسأل دليلك
-- الحدود: الباقة الاحترافية 25 سؤالاً، الذهبية 100 سؤال، المجانية غير متاحة
-- يظهر جواب السؤال للمواطن تلقائياً عبر بحث صفحة «اسأل دليلك» (نفس جدول medical_questions)

-- 1) أعمدة الإسناد
alter table public.medical_questions add column if not exists doctor_id uuid references public.doctors(id) on delete cascade;
alter table public.medical_questions add column if not exists source text not null default 'admin';
create index if not exists idx_medical_questions_doctor on public.medical_questions(doctor_id);

-- 2) قائمة أسئلة الطبيب مع الباقة والحد والعدد
create or replace function public.doctor_qa_list(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_doctor uuid;
  v_plan text;
  v_exp timestamptz;
  v_limit int;
  v_count int;
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

  select plan, plan_expires_at into v_plan, v_exp from public.doctors where id = v_doctor;
  if v_plan in ('pro','gold') and v_exp is not null and v_exp > now() then
    v_limit := case v_plan when 'pro' then 25 when 'gold' then 100 else 0 end;
  else
    v_plan := 'free';
    v_limit := 0;
  end if;

  select count(*) into v_count from public.medical_questions where doctor_id = v_doctor;

  return jsonb_build_object(
    'ok', true,
    'plan', v_plan,
    'limit', v_limit,
    'count', v_count,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', q.id, 'question', q.question, 'answer', q.answer, 'created_at', q.created_at
      ) order by q.created_at desc)
      from public.medical_questions q where q.doctor_id = v_doctor
    ), '[]'::jsonb)
  );
end; $$;

-- 3) إضافة سؤال مع الإجابة (مع فحص حد الباقة ومنع التكرار)
create or replace function public.doctor_qa_add(p_token text, p_question text, p_answer text, p_keywords text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_doctor uuid;
  v_plan text;
  v_exp timestamptz;
  v_limit int;
  v_count int;
  v_qid uuid;
  v_kw text;
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

  p_question := btrim(coalesce(p_question, ''));
  p_answer := btrim(coalesce(p_answer, ''));
  if char_length(p_question) < 5 or char_length(p_answer) < 5 then
    return jsonb_build_object('error', 'السؤال والإجابة قصيران جداً');
  end if;

  select plan, plan_expires_at into v_plan, v_exp from public.doctors where id = v_doctor;
  if not (v_plan in ('pro','gold') and v_exp is not null and v_exp > now()) then
    return jsonb_build_object('error', 'إضافة الأسئلة متاحة لأصحاب الباقة الاحترافية أو الذهبية فقط');
  end if;
  v_limit := case v_plan when 'pro' then 25 when 'gold' then 100 else 0 end;

  select count(*) into v_count from public.medical_questions where doctor_id = v_doctor;
  if v_count >= v_limit then
    return jsonb_build_object('error', 'وصلت الحد الأقصى لعدد الأسئلة في باقتك (' || v_limit || ' سؤالاً)', 'count', v_count, 'limit', v_limit);
  end if;

  if exists (select 1 from public.medical_questions where doctor_id = v_doctor and question = p_question) then
    return jsonb_build_object('error', 'أضفت هذا السؤال مسبقاً');
  end if;

  insert into public.medical_questions (question, answer, doctor_id, source)
  values (p_question, p_answer, v_doctor, 'doctor')
  returning id into v_qid;

  -- كلمات مفتاحية مفصولة بفاصلة لتحسين مطابقة سؤال المواطن في البحث
  if p_keywords is not null and btrim(p_keywords) <> '' then
    for v_kw in select btrim(k) from unnest(string_to_array(p_keywords, ',')) as k where btrim(k) <> '' loop
      insert into public.medical_keywords (question_id, keyword) values (v_qid, v_kw);
    end loop;
  end if;

  return jsonb_build_object('ok', true, 'count', v_count + 1, 'limit', v_limit);
end; $$;

-- 4) حذف سؤال يخص الطبيب صاحب الجلسة فقط
create or replace function public.doctor_qa_delete(p_token text, p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_doctor uuid;
begin
  select entity_id into v_doctor from public.entity_accounts
  where session_token = p_token and token_expires_at > now() and entity_type = 'doctor'
  limit 1;
  if v_doctor is null then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  delete from public.medical_questions where id = p_id and doctor_id = v_doctor;
  if not found then
    return jsonb_build_object('error', 'لم يتم العثور على السؤال');
  end if;
  return jsonb_build_object('ok', true);
end; $$;

grant execute on function public.doctor_qa_list(text) to anon, authenticated;
grant execute on function public.doctor_qa_add(text, text, text, text) to anon, authenticated;
grant execute on function public.doctor_qa_delete(text, uuid) to anon, authenticated;
