-- =====================================================================
-- 15_login_rate_limit.sql
-- Rate limiting untuk percobaan login — mencegah brute-force password.
-- Sengaja berbasis database (bukan in-memory counter di kode Next.js)
-- karena Vercel serverless functions tidak menjamin instance yang sama
-- menangani request berikutnya — in-memory counter akan reset kapan saja
-- dan tidak bisa diandalkan untuk keamanan.
--
-- Tabel ini TIDAK BISA diakses langsung oleh client (tidak ada policy
-- select/insert untuk anon/authenticated) — hanya lewat 3 function
-- security definer di bawah, dipanggil via RPC dari Server Action.
-- =====================================================================

create table public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

create index idx_login_attempts_email_time on public.login_attempts (email, created_at desc);

alter table public.login_attempts enable row level security;
-- Sengaja TIDAK ada policy select/insert/update/delete untuk anon/authenticated
-- — akses HANYA lewat function security definer di bawah. RLS aktif tanpa
-- policy = default deny total untuk akses langsung ke tabel ini.

create or replace function public.is_login_rate_limited(p_email text)
returns boolean
language sql
security definer
stable
as $$
  select count(*) >= 5
  from public.login_attempts
  where email = lower(p_email) and created_at > now() - interval '15 minutes';
$$;

create or replace function public.record_failed_login(p_email text)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.login_attempts (email) values (lower(p_email));
  -- Housekeeping: buang catatan lama supaya tabel tidak membengkak tanpa batas.
  delete from public.login_attempts where created_at < now() - interval '1 day';
end;
$$;

create or replace function public.clear_login_attempts(p_email text)
returns void
language plpgsql
security definer
as $$
begin
  delete from public.login_attempts where email = lower(p_email);
end;
$$;

-- Function baru di Postgres/Supabase default-nya BISA dieksekusi oleh
-- PUBLIC (termasuk role anon) — baris di bawah ini eksplisit supaya
-- tidak bergantung pada default yang bisa saja berubah.
grant execute on function public.is_login_rate_limited(text) to anon, authenticated;
grant execute on function public.record_failed_login(text) to anon, authenticated;
grant execute on function public.clear_login_attempts(text) to anon, authenticated;
