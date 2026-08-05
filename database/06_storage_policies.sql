-- =====================================================================
-- 06_storage_policies.sql
-- Row Level Security untuk Supabase Storage (tabel storage.objects).
-- Bucket "public" di dashboard HANYA mengizinkan orang membaca file lewat
-- URL langsung — upload/update/delete tetap butuh policy eksplisit ini.
--
-- PRASYARAT: 4 bucket berikut sudah dibuat via Dashboard -> Storage
-- (lihat README.md bagian "Setup Supabase" -> langkah 4):
--   profile-pictures, asset-images, atk-images, school-information
-- =====================================================================

-- ---------------------------------------------------------------------
-- PROFILE PICTURES
-- Konvensi path wajib: "{user_id}/nama-file.jpg" — user hanya boleh
-- upload/update/hapus file di dalam folder bernama UID miliknya sendiri.
-- Dicek lewat storage.foldername(name), fungsi bawaan Supabase yang
-- memecah path jadi array folder.
-- ---------------------------------------------------------------------
create policy "profile_pictures_public_read"
  on storage.objects for select
  using (bucket_id = 'profile-pictures');

create policy "profile_pictures_owner_write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'profile-pictures' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "profile_pictures_owner_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'profile-pictures' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "profile_pictures_owner_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'profile-pictures' and (storage.foldername(name))[1] = auth.uid()::text);

-- ---------------------------------------------------------------------
-- ASSET IMAGES / ATK IMAGES / SCHOOL INFORMATION
-- Semua orang boleh baca (ditampilkan di marketplace & halaman Informasi).
-- Hanya Admin/Super Admin yang boleh upload/ubah/hapus.
-- ---------------------------------------------------------------------
create policy "asset_images_public_read"
  on storage.objects for select using (bucket_id = 'asset-images');
create policy "asset_images_admin_write"
  on storage.objects for insert to authenticated with check (bucket_id = 'asset-images' and public.is_admin());
create policy "asset_images_admin_update"
  on storage.objects for update to authenticated using (bucket_id = 'asset-images' and public.is_admin());
create policy "asset_images_admin_delete"
  on storage.objects for delete to authenticated using (bucket_id = 'asset-images' and public.is_admin());

create policy "atk_images_public_read"
  on storage.objects for select using (bucket_id = 'atk-images');
create policy "atk_images_admin_write"
  on storage.objects for insert to authenticated with check (bucket_id = 'atk-images' and public.is_admin());
create policy "atk_images_admin_update"
  on storage.objects for update to authenticated using (bucket_id = 'atk-images' and public.is_admin());
create policy "atk_images_admin_delete"
  on storage.objects for delete to authenticated using (bucket_id = 'atk-images' and public.is_admin());

create policy "school_information_images_public_read"
  on storage.objects for select using (bucket_id = 'school-information');
create policy "school_information_images_admin_write"
  on storage.objects for insert to authenticated with check (bucket_id = 'school-information' and public.is_admin());
create policy "school_information_images_admin_update"
  on storage.objects for update to authenticated using (bucket_id = 'school-information' and public.is_admin());
create policy "school_information_images_admin_delete"
  on storage.objects for delete to authenticated using (bucket_id = 'school-information' and public.is_admin());
