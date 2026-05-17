-- ====================================================
-- Storage bucket cho ảnh món ăn
-- Chạy file này trong Supabase SQL Editor
-- (sau khi đã chạy schema.sql)
-- ====================================================

-- Tạo bucket public
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  2097152,  -- 2MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Cho phép staff upload ảnh
create policy "staff_upload_menu_images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'menu-images');

-- Cho phép staff xoá ảnh
create policy "staff_delete_menu_images"
on storage.objects for delete
to authenticated
using (bucket_id = 'menu-images');

-- Cho phép public xem ảnh (khách hàng xem menu)
create policy "public_read_menu_images"
on storage.objects for select
to public
using (bucket_id = 'menu-images');
