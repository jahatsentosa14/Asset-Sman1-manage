-- =====================================================================
-- 11_fix_registration_rls.sql
-- PERBAIKAN BUG KRITIS: sebelum file ini dijalankan, registrasi siswa
-- SELALU GAGAL karena dua alasan:
--
-- 1. Halaman /register diakses oleh pengunjung yang BELUM LOGIN (role
--    `anon`), tapi policy "classes_select_all" dan
--    "academic_years_select_all" hanya mengizinkan role `authenticated`.
--    Akibatnya dropdown kelas di form registrasi selalu kosong.
--
-- 2. Policy "students_admin_write" dipakai untuk SEMUA operasi (select,
--    insert, update, delete) dan hanya mengizinkan admin. Padahal saat
--    siswa mendaftar sendiri, dia bukan admin — jadi INSERT ke tabel
--    students oleh siswa yang baru mendaftar selalu ditolak RLS.
--
-- File ini menambahkan akses anon untuk (1), dan memisahkan policy
-- students supaya user boleh insert baris miliknya sendiri untuk (2),
-- tanpa mengurangi keamanan (tetap tidak bisa insert/edit data siswa lain).
-- =====================================================================

-- ---------------------------------------------------------------------
-- FIX 1: classes & academic_years harus bisa dibaca anon (belum login)
-- supaya dropdown kelas di halaman Register tidak kosong.
-- ---------------------------------------------------------------------
drop policy if exists "classes_select_all" on public.classes;
create policy "classes_select_all"
  on public.classes for select
  to anon, authenticated
  using (true);

drop policy if exists "academic_years_select_all" on public.academic_years;
create policy "academic_years_select_all"
  on public.academic_years for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------
-- FIX 2: pisahkan policy students — user boleh INSERT baris miliknya
-- sendiri (saat registrasi), tapi TIDAK BOLEH insert/edit data siswa
-- lain. Admin tetap bisa kelola semua siswa seperti sebelumnya.
-- ---------------------------------------------------------------------
drop policy if exists "students_admin_write" on public.students;

create policy "students_insert_own"
  on public.students for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "students_admin_write"
  on public.students for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "students_admin_delete"
  on public.students for delete
  to authenticated
  using (public.is_admin());
