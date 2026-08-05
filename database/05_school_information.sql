-- =====================================================================
-- 05_school_information.sql
-- Tabel untuk halaman "Informasi": Denah Sekolah, Luas Tanah, Tata Ruang,
-- Daftar Ruangan. File gambar fisik disimpan di Supabase Storage bucket
-- "school-information" (lihat README bagian Setup Supabase); tabel ini
-- HANYA menyimpan metadata & URL-nya, sesuai prinsip "Database hanya
-- menyimpan URL" di requirement.
-- =====================================================================

create type school_info_category as enum ('denah', 'luas_tanah', 'tata_ruang', 'daftar_ruangan');

create table public.school_information (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category school_info_category not null,
  image_url text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.school_information is
  'Konten halaman Informasi. display_order menentukan urutan tampil dalam satu kategori yang sama.';

create index idx_school_information_category on public.school_information (category, display_order);

alter table public.school_information enable row level security;

create policy "school_information_select_all"
  on public.school_information for select to authenticated
  using (true);

create policy "school_information_admin_write"
  on public.school_information for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
