-- =====================================================================
-- 07_system_settings.sql
-- Tabel key-value sederhana untuk pengaturan global aplikasi.
-- Saat ini hanya dipakai untuk maintenance_mode, tapi didesain generik
-- (key-value) supaya bisa dipakai untuk flag global lain di masa depan
-- tanpa perlu migration baru.
-- =====================================================================

create table public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

comment on table public.system_settings is
  'Pengaturan global. Baris "maintenance_mode" dibaca oleh middleware.ts pada SETIAP request, jadi harus bisa dibaca bahkan oleh pengguna yang belum login (role anon).';

alter table public.system_settings enable row level security;

-- Dibaca oleh anon (belum login) DAN authenticated, karena middleware perlu
-- tahu status maintenance_mode sebelum tahu siapa yang mengakses.
create policy "system_settings_select_all"
  on public.system_settings for select
  to anon, authenticated
  using (true);

create policy "system_settings_admin_write"
  on public.system_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create trigger trg_system_settings_updated_at before update on public.system_settings
  for each row execute function public.set_updated_at();

insert into public.system_settings (key, value) values ('maintenance_mode', 'false'::jsonb);
