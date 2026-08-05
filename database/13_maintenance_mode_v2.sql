-- =====================================================================
-- 13_maintenance_mode_v2.sql
-- Mengubah bentuk value 'maintenance_mode' di system_settings dari
-- boolean sederhana (true/false) menjadi objek terstruktur, supaya
-- mendukung custom message dan countdown di halaman /maintenance.
-- =====================================================================

update public.system_settings
set value = jsonb_build_object('active', false, 'message', null, 'endsAt', null)
where key = 'maintenance_mode';
