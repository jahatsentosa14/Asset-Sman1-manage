-- =====================================================================
-- 12_demo_seed.sql
-- Data CONTOH untuk mempercepat testing (bukan data wajib produksi).
-- Aman dijalankan di project baru; SKIP file ini jika sekolah ingin
-- mulai dari data benar-benar kosong dan mengisi semuanya manual lewat
-- Admin Dashboard.
--
-- CATATAN PENTING soal akun (Super Admin/Guru/Siswa):
-- Akun login (auth.users) TIDAK dibuat lewat SQL di file ini. Supabase
-- Auth mengelola password/hashing secara internal lewat GoTrue — insert
-- manual ke auth.users lewat SQL tidak didukung resmi dan berisiko rusak
-- di update Supabase berikutnya. Cara yang BENAR:
--   1. Super Admin pertama : Dashboard Supabase -> Authentication -> Users
--      -> "Add user" -> centang "Auto Confirm User" -> buat akunnya.
--      Lalu jalankan query di paling bawah file ini (ganti UUID-nya)
--      untuk menaikkan role user tsb jadi 'super_admin'.
--   2. Guru & Admin lain   : lewat halaman "/admin/staff" di aplikasi
--      (dibuat oleh Super Admin setelah langkah 1 selesai).
--   3. Siswa               : lewat halaman "/register" di aplikasi.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 36 KELAS — pola realistis SMA: X (12 kelas, belum ada jurusan),
-- XI & XII (masing-masing 4 IPA + 4 IPS + 4 Bahasa = 12 kelas).
-- Total: 12 + 12 + 12 = 36 kelas, sesuai tahun ajaran aktif.
-- ---------------------------------------------------------------------
do $$
declare
  active_year_id uuid;
  i int;
begin
  select id into active_year_id from public.academic_years where status = 'active' limit 1;

  if active_year_id is null then
    raise exception 'Tidak ada tahun ajaran aktif. Jalankan 04_seed.sql terlebih dahulu.';
  end if;

  -- Kelas X 1-12 (belum ada jurusan)
  for i in 1..12 loop
    insert into public.classes (name, grade_level, major, academic_year_id)
    values ('X-' || i, 10, null, active_year_id);
  end loop;

  -- Kelas XI & XII: 4 IPA + 4 IPS + 4 Bahasa masing-masing tingkat
  for i in 1..4 loop
    insert into public.classes (name, grade_level, major, academic_year_id) values
      ('XI IPA ' || i, 11, 'IPA', active_year_id),
      ('XI IPS ' || i, 11, 'IPS', active_year_id),
      ('XI Bahasa ' || i, 11, 'Bahasa', active_year_id),
      ('XII IPA ' || i, 12, 'IPA', active_year_id),
      ('XII IPS ' || i, 12, 'IPS', active_year_id),
      ('XII Bahasa ' || i, 12, 'Bahasa', active_year_id);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- CONTOH ASSET — data ini tidak butuh akun (aman lewat SQL murni)
-- ---------------------------------------------------------------------
insert into public.assets (name, description, category_id, location, total_stock, available_stock, status)
select
  v.name, v.description,
  (select id from public.asset_categories where name = v.category_name limit 1),
  v.location, v.total_stock, v.total_stock, 'available'
from (values
  ('Proyektor Epson', 'Proyektor untuk presentasi kelas', 'Elektronik', 'Ruang Multimedia', 5, 5),
  ('Kamera Canon EOS', 'Kamera DSLR untuk dokumentasi kegiatan', 'Elektronik', 'Ruang OSIS', 2, 2),
  ('Bola Basket', 'Bola basket ukuran standar', 'Olahraga', 'Gudang Olahraga', 10, 10),
  ('Bola Voli', 'Bola voli ukuran standar', 'Olahraga', 'Gudang Olahraga', 8, 8),
  ('Mikroskop', 'Mikroskop untuk praktikum Biologi', 'Laboratorium', 'Lab Biologi', 15, 15),
  ('Gitar Akustik', 'Gitar untuk ekstrakurikuler musik', 'Kesenian', 'Ruang Kesenian', 4, 4),
  ('Meja Lipat', 'Meja lipat untuk acara/kegiatan luar ruangan', 'Furnitur', 'Gudang Umum', 20, 20)
) as v(name, description, category_name, location, total_stock, _dup)
where not exists (select 1 from public.assets a where a.name = v.name);

-- ---------------------------------------------------------------------
-- CONTOH ATK
-- ---------------------------------------------------------------------
insert into public.atk_items (name, stock, unit)
select v.name, v.stock, v.unit
from (values
  ('Spidol Whiteboard', 50, 'pcs'),
  ('Kertas HVS A4', 20, 'rim'),
  ('Bolpoin', 100, 'pcs'),
  ('Penghapus Whiteboard', 15, 'pcs'),
  ('Tinta Printer', 10, 'botol')
) as v(name, stock, unit)
where not exists (select 1 from public.atk_items i where i.name = v.name);

-- =====================================================================
-- LANGKAH MANUAL SETELAH INI (jangan dijalankan sebagai bagian file ini
-- — jalankan terpisah setelah Anda membuat user pertama lewat Dashboard):
--
-- update public.profiles
-- set role = 'super_admin', full_name = 'Nama Super Admin'
-- where id = 'GANTI_DENGAN_UUID_USER_DARI_AUTHENTICATION_USERS';
--
-- Catatan: baris di public.profiles untuk user tsb baru akan otomatis
-- ada SETELAH user login pertama kali... TIDAK, profiles diisi lewat
-- flow /register atau /admin/staff, BUKAN otomatis oleh Supabase Auth.
-- Untuk Super Admin pertama yang dibuat manual lewat Dashboard, Anda
-- HARUS insert baris profiles-nya sendiri:
--
-- insert into public.profiles (id, full_name, role, gender)
-- values ('GANTI_DENGAN_UUID_USER', 'Nama Super Admin', 'super_admin', 'male');
-- =====================================================================
