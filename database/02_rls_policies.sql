-- =====================================================================
-- 02_rls_policies.sql
-- Row Level Security (RLS): aturan "siapa boleh lihat/ubah baris mana".
-- Tanpa ini, siapa pun yang punya anon key bisa baca/tulis SEMUA data
-- lewat Supabase client — RLS adalah lapisan keamanan WAJIB, bukan opsional.
-- =====================================================================

-- Helper function: ambil role user yang sedang login.
-- security definer supaya function ini boleh baca tabel profiles
-- walau pemanggilnya belum tentu punya akses langsung ke tabel itu.
create or replace function public.current_user_role()
returns user_role
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select public.current_user_role() in ('admin', 'super_admin');
$$;

-- ---------------------------------------------------------------------
-- PROFILES
-- Semua orang login boleh baca profil orang lain (perlu untuk menampilkan
-- nama peminjam di Today's Activity). Tapi hanya boleh EDIT profil sendiri,
-- kecuali admin yang boleh edit siapa saja (misal reset data guru).
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_all_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- CLASSES / STUDENTS
-- Semua user login boleh baca (untuk keperluan filter & tampilan).
-- Hanya admin boleh insert/update/delete (naik kelas, buat kelas baru, dll).
-- ---------------------------------------------------------------------
alter table public.classes enable row level security;
alter table public.students enable row level security;

create policy "classes_select_all" on public.classes for select to authenticated using (true);
create policy "classes_admin_write" on public.classes for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "students_select_all" on public.students for select to authenticated using (true);
create policy "students_admin_write" on public.students for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- ACADEMIC YEARS
-- Semua boleh baca. Hanya admin yang boleh buat/ubah tahun ajaran.
-- ---------------------------------------------------------------------
alter table public.academic_years enable row level security;

create policy "academic_years_select_all" on public.academic_years for select to authenticated using (true);
create policy "academic_years_admin_write" on public.academic_years for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- ASSET CATEGORIES / ASSETS / ATK ITEMS
-- Semua boleh baca (marketplace-style browsing). Hanya admin boleh kelola stok.
-- ---------------------------------------------------------------------
alter table public.asset_categories enable row level security;
alter table public.assets enable row level security;
alter table public.atk_items enable row level security;

create policy "asset_categories_select_all" on public.asset_categories for select to authenticated using (true);
create policy "asset_categories_admin_write" on public.asset_categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "assets_select_all" on public.assets for select to authenticated using (true);
create policy "assets_admin_write" on public.assets for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "atk_items_select_all" on public.atk_items for select to authenticated using (true);
create policy "atk_items_admin_write" on public.atk_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- LOANS / LOAN ITEMS
-- User biasa: hanya boleh lihat & buat peminjaman miliknya sendiri.
-- Admin: boleh lihat & ubah semua (approve/reject/catat kondisi kembali).
-- User TIDAK BOLEH mengubah status sendiri (mencegah user approve sendiri).
-- ---------------------------------------------------------------------
alter table public.loans enable row level security;
alter table public.loan_items enable row level security;

create policy "loans_select_own_or_admin"
  on public.loans for select to authenticated
  using (borrower_id = auth.uid() or public.is_admin());

create policy "loans_insert_own"
  on public.loans for insert to authenticated
  with check (borrower_id = auth.uid());

-- User hanya boleh update baris miliknya sendiri, dan HANYA jika sedang
-- membatalkan pengajuan yang belum diproses (pending_approval -> cancelled)
-- atau meminta pengembalian (approved -> return_requested).
-- Validasi transisi status yang lebih detail dilakukan di 03_functions.sql (trigger).
create policy "loans_update_own_limited"
  on public.loans for update to authenticated
  using (borrower_id = auth.uid() and status in ('pending_approval', 'approved'))
  with check (borrower_id = auth.uid());

create policy "loans_admin_write"
  on public.loans for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "loan_items_select_own_or_admin"
  on public.loan_items for select to authenticated
  using (
    exists (
      select 1 from public.loans l
      where l.id = loan_items.loan_id
      and (l.borrower_id = auth.uid() or public.is_admin())
    )
  );

create policy "loan_items_insert_own"
  on public.loan_items for insert to authenticated
  with check (
    exists (
      select 1 from public.loans l
      where l.id = loan_items.loan_id and l.borrower_id = auth.uid()
    )
  );

create policy "loan_items_admin_write"
  on public.loan_items for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- ATK REQUESTS / ITEMS — pola sama persis dengan loans, tanpa pengembalian
-- ---------------------------------------------------------------------
alter table public.atk_requests enable row level security;
alter table public.atk_request_items enable row level security;

create policy "atk_requests_select_own_or_admin"
  on public.atk_requests for select to authenticated
  using (requester_id = auth.uid() or public.is_admin());

create policy "atk_requests_insert_own"
  on public.atk_requests for insert to authenticated
  with check (requester_id = auth.uid());

create policy "atk_requests_admin_write"
  on public.atk_requests for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "atk_request_items_select_own_or_admin"
  on public.atk_request_items for select to authenticated
  using (
    exists (
      select 1 from public.atk_requests r
      where r.id = atk_request_items.request_id
      and (r.requester_id = auth.uid() or public.is_admin())
    )
  );

create policy "atk_request_items_insert_own"
  on public.atk_request_items for insert to authenticated
  with check (
    exists (
      select 1 from public.atk_requests r
      where r.id = atk_request_items.request_id and r.requester_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- STOCK OPNAME — hanya admin
-- ---------------------------------------------------------------------
alter table public.stock_opname_sessions enable row level security;
alter table public.stock_opname_items enable row level security;

create policy "stock_opname_admin_only"
  on public.stock_opname_sessions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "stock_opname_items_admin_only"
  on public.stock_opname_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- ACTIVITY LOGS
-- Semua user login boleh baca (dibutuhkan untuk Today's Activity & History).
-- TIDAK ADA policy insert/update/delete untuk role authenticated biasa —
-- tabel ini HANYA diisi lewat trigger (security definer), tidak dari client.
-- ---------------------------------------------------------------------
alter table public.activity_logs enable row level security;

create policy "activity_logs_select_all"
  on public.activity_logs for select to authenticated
  using (true);
