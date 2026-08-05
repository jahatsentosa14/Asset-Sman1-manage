-- =====================================================================
-- 14_maintenance_activity_log.sql
-- Function untuk mencatat toggle Maintenance Mode ke activity_logs,
-- supaya Discord Bot bisa mengirim notifikasi (requirement: "Maintenance
-- notifications" di Discord Bot). Dipanggil via RPC dari Server Action,
-- BUKAN insert langsung dari client, supaya activity_logs tetap hanya
-- diisi lewat logic terpercaya (function security definer / trigger).
-- =====================================================================

create or replace function public.log_maintenance_toggle(
  is_active boolean,
  custom_message text,
  ends_at timestamptz
)
returns void language plpgsql security definer as $$
declare
  actor_name text;
begin
  -- Hanya admin/super_admin yang boleh memicu ini — dicek dua kali:
  -- di sini (database) dan di server action (aplikasi), sesuai prinsip
  -- "never trust client data" / defense in depth.
  if not public.is_admin() then
    raise exception 'Hanya admin yang boleh mengubah maintenance mode.';
  end if;

  select full_name into actor_name from public.profiles where id = auth.uid();

  insert into public.activity_logs (actor_id, action, target_type, target_id, metadata)
  values (
    auth.uid(),
    case when is_active then 'maintenance_enabled' else 'maintenance_disabled' end,
    'system',
    auth.uid(), -- tidak ada entitas spesifik untuk system-wide event, pakai id admin sebagai placeholder
    jsonb_build_object('actor_name', actor_name, 'message', custom_message, 'ends_at', ends_at)
  );
end;
$$;
