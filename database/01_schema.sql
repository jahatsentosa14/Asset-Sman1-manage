-- =====================================================================
-- SMA NEGERI 1 CIKEMBAR — SCHOOL ASSET MANAGEMENT
-- File: 01_schema.sql
-- Jalankan file ini di Supabase SQL Editor SETELAH project Supabase dibuat.
-- Urutan menjalankan file di folder /database:
--   1. 01_schema.sql        (file ini — struktur tabel)
--   2. 02_rls_policies.sql  (aturan keamanan baris)
--   3. 03_functions.sql     (function & trigger otomatis)
--   4. 04_seed.sql          (data awal wajib, misal: role, kategori default)
-- =====================================================================

-- Ekstensi wajib: UUID generator
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1. ENUM TYPES
-- Kenapa pakai ENUM? Supaya database menolak nilai yang tidak valid
-- (misal role "siswa" typo jadi "sisw") sebelum sampai ke aplikasi.
-- ---------------------------------------------------------------------

create type user_role as enum ('student', 'teacher', 'admin', 'super_admin');
create type user_gender as enum ('male', 'female');
create type student_status as enum ('active', 'alumni', 'inactive');

create type asset_status as enum ('available', 'pending', 'borrowed', 'maintenance');
create type asset_condition as enum ('good', 'minor_damage', 'major_damage', 'lost');

create type loan_status as enum (
  'pending_approval',   -- menunggu approval admin
  'approved',           -- disetujui, barang sedang dipinjam
  'rejected',           -- ditolak admin
  'return_requested',   -- user klik "kembalikan", menunggu approval
  'returned',           -- selesai, sudah dicek kondisi oleh admin
  'cancelled'           -- dibatalkan peminjam sebelum di-approve
);

create type atk_request_status as enum (
  'pending_approval',
  'approved',
  'rejected',
  'fulfilled'
);

create type academic_year_status as enum ('draft', 'active', 'archived');

-- ---------------------------------------------------------------------
-- 2. PROFILES
-- Tabel ini adalah "kepanjangan tangan" dari auth.users milik Supabase Auth.
-- Kenapa dipisah dari auth.users? Karena auth.users dikelola penuh oleh
-- Supabase dan tidak boleh kita tambahi kolom bebas. Maka kita buat tabel
-- profiles yang punya foreign key 1-ke-1 ke auth.users.
-- ---------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'student',
  gender user_gender not null,
  avatar_url text,                     -- URL dari bucket "profile-pictures", bukan file-nya
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Data tambahan tiap pengguna. 1 baris = 1 akun auth.users. Dipisah dari auth.users karena Supabase Auth tidak boleh diberi kolom kustom langsung.';

-- ---------------------------------------------------------------------
-- 3. ACADEMIC YEARS
-- Setiap transaksi di sistem (peminjaman, ATK, dsb.) tercatat memiliki
-- academic_year_id supaya laporan bisa difilter per tahun ajaran.
-- Dibuat di awal karena banyak tabel lain punya foreign key ke sini.
-- ---------------------------------------------------------------------

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,          -- contoh: "2025/2026"
  status academic_year_status not null default 'draft',
  started_at date,
  ended_at date,
  created_at timestamptz not null default now()
);

comment on table public.academic_years is
  'Hanya 1 baris boleh berstatus active pada satu waktu — dijaga oleh trigger di 03_functions.sql.';

-- ---------------------------------------------------------------------
-- 4. CLASSES & STUDENTS (detail khusus siswa)
-- Dipisah dari profiles karena field ini HANYA berlaku untuk role student
-- (kelas, NISN, status alumni). Guru/Admin tidak butuh kolom ini.
-- Normalisasi: menghindari banyak kolom NULL di tabel profiles untuk guru/admin.
-- ---------------------------------------------------------------------

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,                  -- contoh: "X IPA 1"
  grade_level smallint not null check (grade_level in (10, 11, 12)),
  major text,                          -- contoh: "IPA", "IPS", null jika kelas 10 belum jurusan
  academic_year_id uuid not null references public.academic_years(id),
  created_at timestamptz not null default now()
);

create table public.students (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id),
  nisn text,                           -- opsional sesuai requirement
  status student_status not null default 'active',
  graduated_at timestamptz,            -- diisi saat status berubah jadi alumni
  created_at timestamptz not null default now()
);

comment on table public.students is
  'Detail spesifik siswa. Saat siswa lulus, status diubah ke alumni TIDAK dihapus — histori harus tetap ada (requirement wajib).';

-- ---------------------------------------------------------------------
-- 5. ASSET CATEGORIES & ASSETS
-- ---------------------------------------------------------------------

create table public.asset_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,           -- contoh: "Elektronik", "Olahraga"
  created_at timestamptz not null default now()
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category_id uuid references public.asset_categories(id),
  image_url text,                      -- URL dari bucket "asset-images"
  location text,                       -- contoh: "Ruang Lab Fisika"
  total_stock integer not null check (total_stock >= 0),
  available_stock integer not null check (available_stock >= 0),
  status asset_status not null default 'available',
  is_deleted boolean not null default false,   -- soft delete
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint available_not_exceed_total check (available_stock <= total_stock)
);

comment on table public.assets is
  'available_stock diperbarui otomatis oleh trigger tiap kali ada peminjaman/pengembalian disetujui (lihat 03_functions.sql). Soft delete via is_deleted, bukan DELETE, agar histori peminjaman lama tidak kehilangan referensi barang.';

-- ---------------------------------------------------------------------
-- 6. ATK (Alat Tulis Kantor) — tidak ada pengembalian
-- ---------------------------------------------------------------------

create table public.atk_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  stock integer not null check (stock >= 0),
  unit text not null default 'pcs',    -- contoh: pcs, box, rim
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. LOANS (Peminjaman Asset) + ITEMS
-- Header/detail pattern: 1 transaksi peminjaman bisa berisi banyak barang
-- (pola "cart" marketplace sesuai requirement).
-- ---------------------------------------------------------------------

create table public.loans (
  id uuid primary key default gen_random_uuid(),
  borrower_id uuid not null references public.profiles(id),
  academic_year_id uuid not null references public.academic_years(id),
  status loan_status not null default 'pending_approval',
  notes text,
  rejected_reason text,                 -- wajib diisi jika status = rejected
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  returned_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.loan_items (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references public.loans(id) on delete cascade,
  asset_id uuid not null references public.assets(id),
  quantity integer not null check (quantity > 0),
  condition_on_return asset_condition,  -- diisi admin saat pengembalian dicek
  created_at timestamptz not null default now()
);

comment on table public.loans is
  'Header transaksi peminjaman. rejected_reason WAJIB diisi (divalidasi di 02_rls_policies.sql / application layer) ketika admin menolak — sesuai requirement "Reject wajib memiliki alasan".';

-- ---------------------------------------------------------------------
-- 8. ATK REQUESTS
-- ---------------------------------------------------------------------

create table public.atk_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id),
  academic_year_id uuid not null references public.academic_years(id),
  status atk_request_status not null default 'pending_approval',
  rejected_reason text,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.atk_request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.atk_requests(id) on delete cascade,
  atk_item_id uuid not null references public.atk_items(id),
  quantity integer not null check (quantity > 0)
);

-- ---------------------------------------------------------------------
-- 9. STOCK OPNAME
-- ---------------------------------------------------------------------

create table public.stock_opname_sessions (
  id uuid primary key default gen_random_uuid(),
  conducted_by uuid not null references public.profiles(id),
  academic_year_id uuid not null references public.academic_years(id),
  notes text,
  created_at timestamptz not null default now()
);

create table public.stock_opname_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.stock_opname_sessions(id) on delete cascade,
  asset_id uuid references public.assets(id),
  atk_item_id uuid references public.atk_items(id),
  system_stock integer not null,       -- stock menurut sistem sebelum opname
  physical_stock integer not null,     -- stock hasil hitung fisik
  discrepancy integer generated always as (physical_stock - system_stock) stored,
  constraint one_target_only check (
    (asset_id is not null and atk_item_id is null) or
    (asset_id is null and atk_item_id is not null)
  )
);

comment on table public.stock_opname_items is
  'Satu baris hanya boleh menunjuk ke asset ATAU atk_item, tidak dua-duanya — dijaga constraint one_target_only.';

-- ---------------------------------------------------------------------
-- 10. ACTIVITY LOG (untuk Today's Activity & History realtime)
-- Tabel append-only: tidak pernah di-UPDATE atau DELETE, hanya INSERT.
-- Ini yang menjadi sumber data "Today's Activity" dan seluruh History.
-- ---------------------------------------------------------------------

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),   -- siapa yang melakukan aksi
  action text not null,                            -- contoh: 'loan_created', 'loan_approved'
  target_type text not null,                       -- 'loan' | 'atk_request' | 'asset' | dst
  target_id uuid not null,
  academic_year_id uuid references public.academic_years(id),
  metadata jsonb not null default '{}',            -- detail bebas: nama barang, jumlah, dsb
  created_at timestamptz not null default now()
);

comment on table public.activity_logs is
  'Sumber data utama untuk Today''s Activity timeline dan seluruh halaman History. Diisi otomatis oleh trigger (03_functions.sql), bukan ditulis manual dari frontend, supaya konsisten.';

-- ---------------------------------------------------------------------
-- 11. INDEXES
-- Ditambahkan pada kolom yang sering dipakai di WHERE / JOIN / ORDER BY.
-- ---------------------------------------------------------------------

create index idx_loans_borrower on public.loans (borrower_id);
create index idx_loans_status on public.loans (status);
create index idx_loans_academic_year on public.loans (academic_year_id);
create index idx_atk_requests_requester on public.atk_requests (requester_id);
create index idx_activity_logs_created_at on public.activity_logs (created_at desc);
create index idx_activity_logs_academic_year on public.activity_logs (academic_year_id);
create index idx_assets_category on public.assets (category_id);
create index idx_assets_status on public.assets (status) where is_deleted = false;
create index idx_students_class on public.students (class_id);
