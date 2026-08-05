-- =====================================================================
-- 08_voice_notification_metadata.sql
-- Memperkaya (CREATE OR REPLACE, bukan mengubah struktur tabel) trigger
-- activity log dari 03_functions.sql supaya metadata-nya cukup lengkap
-- untuk disusun jadi kalimat oleh Voice Notification (Web Speech API)
-- di frontend, tanpa perlu query tambahan saat event realtime diterima.
-- =====================================================================

create or replace function public.log_loan_activity()
returns trigger language plpgsql security definer as $$
declare
  actor_info record;
  items_text text;
begin
  if tg_op = 'INSERT' then
    select p.full_name, p.role, p.gender, c.name as class_name
      into actor_info
      from public.profiles p
      left join public.students s on s.profile_id = p.id
      left join public.classes c on c.id = s.class_id
      where p.id = new.borrower_id;

    select string_agg(a.name || ' (' || li.quantity || ')', ', ')
      into items_text
      from public.loan_items li join public.assets a on a.id = li.asset_id
      where li.loan_id = new.id;

    insert into public.activity_logs (actor_id, action, target_type, target_id, academic_year_id, metadata)
    values (
      new.borrower_id, 'loan_created', 'loan', new.id, new.academic_year_id,
      jsonb_build_object(
        'actor_name', actor_info.full_name,
        'actor_role', actor_info.role,
        'actor_gender', actor_info.gender,
        'class_name', actor_info.class_name,
        'items_text', items_text
      )
    );
  elsif tg_op = 'UPDATE' and old.status <> new.status then
    insert into public.activity_logs (actor_id, action, target_type, target_id, academic_year_id, metadata)
    values (
      coalesce(new.approved_by, new.borrower_id),
      'loan_status_changed_to_' || new.status,
      'loan', new.id, new.academic_year_id,
      jsonb_build_object('from_status', old.status, 'to_status', new.status)
    );
  end if;
  return new;
end;
$$;

create or replace function public.log_atk_activity()
returns trigger language plpgsql security definer as $$
declare
  actor_info record;
  items_text text;
begin
  if tg_op = 'INSERT' then
    select p.full_name, p.role, p.gender, c.name as class_name
      into actor_info
      from public.profiles p
      left join public.students s on s.profile_id = p.id
      left join public.classes c on c.id = s.class_id
      where p.id = new.requester_id;

    select string_agg(ai.name || ' (' || ari.quantity || ')', ', ')
      into items_text
      from public.atk_request_items ari join public.atk_items ai on ai.id = ari.atk_item_id
      where ari.request_id = new.id;

    insert into public.activity_logs (actor_id, action, target_type, target_id, academic_year_id, metadata)
    values (
      new.requester_id, 'atk_request_created', 'atk_request', new.id, new.academic_year_id,
      jsonb_build_object(
        'actor_name', actor_info.full_name,
        'actor_role', actor_info.role,
        'actor_gender', actor_info.gender,
        'class_name', actor_info.class_name,
        'items_text', items_text
      )
    );
  elsif tg_op = 'UPDATE' and old.status <> new.status then
    insert into public.activity_logs (actor_id, action, target_type, target_id, academic_year_id, metadata)
    values (
      coalesce(new.approved_by, new.requester_id),
      'atk_request_status_changed_to_' || new.status,
      'atk_request', new.id, new.academic_year_id,
      jsonb_build_object('from_status', old.status, 'to_status', new.status)
    );
  end if;
  return new;
end;
$$;
