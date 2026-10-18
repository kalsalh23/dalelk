-- ترحيل: موثوقية الإشعارات الدائمة
-- المشكلة: متصفحات الجوال تُبطل/تُديّر اشتراكات الدفع بعد يوم-يومين، ولا آلية للتجديد أو التنظيف
-- الحل: (1) ترحيل الاشتراك المُدار (2) تطهير الموتى (3) سجل دفع المناوبة لضمان الاستمرارية

-- ===== 1) ترحيل الاشتراك عند تدويره من المتصفح (pushsubscriptionchange) =====
create or replace function public.push_refresh(p_old_endpoint text, p_endpoint text, p_p256dh text, p_auth text)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if coalesce(p_endpoint, '') = '' or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    return jsonb_build_object('error', 'بيانات ناقصة');
  end if;
  if p_endpoint ~ '^https://' then
    -- مواطن: نقل الصف القديم (بأعلامه) إلى النقطة الجديدة
    update public.push_subscriptions
      set endpoint = p_endpoint, p256dh = p_p256dh, auth = p_auth
      where endpoint = p_old_endpoint;
    -- جهة (طبيب): نفس الشيء
    update public.entity_push_subscriptions
      set endpoint = p_endpoint, p256dh = p_p256dh, auth = p_auth
      where endpoint = p_old_endpoint;
    -- لم يوجد القديم (مثلًا طُهر سابقاً): أنشئ اشتراك مواطن افتراضي
    if not found and not exists (select 1 from public.push_subscriptions where endpoint = p_endpoint) then
      insert into public.push_subscriptions (endpoint, p256dh, auth, wants_news, wants_daily_duty)
      values (p_endpoint, p_p256dh, p_auth, true, true)
      on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth;
    end if;
    return jsonb_build_object('ok', true);
  end if;
  return jsonb_build_object('error', 'نقطة غير صالحة');
end; $$;

-- ===== 2) تطهير الاشتراكات الميتة (404/410) — يستدعيه الخادم فقط بالسر =====
create or replace function public.purge_dead_push(p_secret text, p_endpoints jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  ep text;
  removed int := 0;
begin
  if p_secret is distinct from '0b19a3b86555079a6a05dd6ef21a65a802719e4735a7cc68' then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  for ep in select jsonb_array_elements_text(p_endpoints) loop
    delete from public.push_subscriptions where endpoint = ep;
    if found then removed := removed + 1; end if;
    delete from public.entity_push_subscriptions where endpoint = ep;
    if found then removed := removed + 1; end if;
  end loop;
  return jsonb_build_object('ok', true, 'removed', removed);
end; $$;

-- ===== 3) سجل دفعات المناوبة — لشبكة الأمان اليومية =====
create table if not exists public.push_log (
  id bigserial primary key,
  event text not null,
  sent int default 0,
  total int default 0,
  created_at timestamptz default now()
);

-- آخر دفعة مناوبة: فارغة أو أقدم من 9 ساعات؟
create or replace function public.duty_push_status(p_secret text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_last timestamptz;
begin
  if p_secret is distinct from 'c50196c783f0cdf26fdfc592590bfbe3' then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  select max(created_at) into v_last from public.push_log where event = 'duty';
  return jsonb_build_object(
    'ok', true,
    'last_push', v_last,
    'stale', (v_last is null or v_last < now() - interval '9 hours')
  );
end; $$;

create or replace function public.duty_log_mark(p_secret text, p_sent int, p_total int)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if p_secret is distinct from 'c50196c783f0cdf26fdfc592590bfbe3' then
    return jsonb_build_object('error', 'unauthorized');
  end if;
  insert into public.push_log (event, sent, total) values ('duty', p_sent, p_total);
  return jsonb_build_object('ok', true);
end; $$;

grant execute on function public.push_refresh(text, text, text, text) to anon, authenticated;
grant execute on function public.purge_dead_push(text, jsonb) to anon, authenticated;
grant execute on function public.duty_push_status(text) to anon, authenticated;
grant execute on function public.duty_log_mark(text, int, int) to anon, authenticated;
