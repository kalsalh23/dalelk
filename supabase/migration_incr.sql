create or replace function public.increment_view_count(table_name text, row_id uuid)
returns void language plpgsql security definer as $$
declare
  allowed text[] := array['doctors','clinics','hospitals','health_centers','pharmacies','labs','radiology_centers','articles','news_items'];
begin
  if table_name = any(allowed) then
    execute format('update public.%I set view_count = view_count + 1 where id = $1', table_name) using row_id;
  end if;
end;
$$;
grant execute on function public.increment_view_count(text, uuid) to anon, authenticated;

create or replace function public.increment_ad_click(ad_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.advertisements set clicks = clicks + 1 where id = ad_id;
end;
$$;
grant execute on function public.increment_ad_click(uuid) to anon, authenticated;