-- =====================================================================
-- 04_seed.sql
-- Data awal yang WAJIB ada supaya aplikasi bisa langsung dipakai.
-- Ini BUKAN dummy/contoh — ini data operasional nyata yang harus diisi
-- sebelum sekolah mulai memakai sistem. Sesuaikan nilainya dengan kondisi
-- SMA Negeri 1 Cikembar yang sebenarnya sebelum dijalankan.
-- =====================================================================

-- Tahun ajaran aktif pertama saat sistem mulai dipakai.
-- GANTI label sesuai tahun ajaran berjalan saat go-live.
insert into public.academic_years (label, status, started_at)
values ('2025/2026', 'active', '2025-07-01');

-- Kategori asset dasar — sesuaikan/tambah lewat Admin Dashboard nanti,
-- ini hanya starting point supaya form "Tambah Barang" tidak kosong.
insert into public.asset_categories (name) values
  ('Elektronik'),
  ('Olahraga'),
  ('Laboratorium'),
  ('Kesenian'),
  ('Furnitur');
