-- إعداد تخزين الصور (Storage)
insert into storage.buckets (id, name, public)
values ('medical', 'medical', true)
on conflict (id) do nothing;

-- القراءة العامة
drop policy if exists "public_read_medical_objects" on storage.objects;
create policy "public_read_medical_objects"
on storage.objects for select
using (bucket_id = 'medical');

-- الكتابة للمسؤول فقط
drop policy if exists "admin_insert_medical_objects" on storage.objects;
create policy "admin_insert_medical_objects"
on storage.objects for insert to authenticated
with check (bucket_id = 'medical' and public.is_admin(auth.uid()));

drop policy if exists "admin_update_medical_objects" on storage.objects;
create policy "admin_update_medical_objects"
on storage.objects for update to authenticated
using (bucket_id = 'medical' and public.is_admin(auth.uid()))
with check (bucket_id = 'medical' and public.is_admin(auth.uid()));

drop policy if exists "admin_delete_medical_objects" on storage.objects;
create policy "admin_delete_medical_objects"
on storage.objects for delete to authenticated
using (bucket_id = 'medical' and public.is_admin(auth.uid()));