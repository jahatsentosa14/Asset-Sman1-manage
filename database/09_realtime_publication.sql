-- =====================================================================
-- 09_realtime_publication.sql
-- Mendaftarkan tabel ke publication "supabase_realtime" bawaan Supabase.
-- Tanpa ini, subscribe realtime dari frontend (supabase.channel(...)) tidak
-- akan menerima event apa pun walau RLS sudah mengizinkan SELECT.
-- =====================================================================

alter publication supabase_realtime add table public.activity_logs;
alter publication supabase_realtime add table public.loans;
alter publication supabase_realtime add table public.atk_requests;
alter publication supabase_realtime add table public.assets;
alter publication supabase_realtime add table public.atk_items;
