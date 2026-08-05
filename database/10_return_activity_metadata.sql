-- =====================================================================
-- 10_return_activity_metadata.sql
-- Memperkaya (CREATE OR REPLACE) log_loan_activity supaya event
-- "return_requested" juga punya metadata lengkap (nama, role, kelas,
-- barang) — dibutuhkan Discord Bot untuk notifikasi Approval Pengembalian
-- dengan format yang sama seperti Approval Pinjam.
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
    -- Untuk transisi ke return_requested, sertakan metadata lengkap yang sama
    -- seperti loan_created — dipakai Discord Bot untuk notifikasi Approval
    -- Pengembalian. Transisi status lain tetap ringkas (from_status/to_status saja).
    if new.status = 'return_requested' then
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
        new.borrower_id, 'loan_status_changed_to_return_requested', 'loan', new.id, new.academic_year_id,
        jsonb_build_object(
          'actor_name', actor_info.full_name,
          'actor_role', actor_info.role,
          'actor_gender', actor_info.gender,
          'class_name', actor_info.class_name,
          'items_text', items_text,
          'from_status', old.status,
          'to_status', new.status
        )
      );
    else
      insert into public.activity_logs (actor_id, action, target_type, target_id, academic_year_id, metadata)
      values (
        coalesce(new.approved_by, new.borrower_id),
        'loan_status_changed_to_' || new.status,
        'loan', new.id, new.academic_year_id,
        jsonb_build_object('from_status', old.status, 'to_status', new.status)
      );
    end if;
  end if;
  return new;
end;
$$;
