-- =====================================================================
-- 03_functions.sql
-- Function & trigger yang membuat data konsisten OTOMATIS di level
-- database, supaya tidak bergantung pada frontend (yang bisa bug/di-bypass).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Auto-update kolom updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_assets_updated_at before update on public.assets
  for each row execute function public.set_updated_at();
create trigger trg_atk_items_updated_at before update on public.atk_items
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 2. Hanya satu academic_year yang boleh 'active'
-- ---------------------------------------------------------------------
create or replace function public.enforce_single_active_academic_year()
returns trigger language plpgsql as $$
begin
  if new.status = 'active' then
    update public.academic_years
      set status = 'archived'
      where status = 'active' and id <> new.id;
  end if;
  return new;
end;
$$;

create trigger trg_single_active_academic_year
  before insert or update on public.academic_years
  for each row execute function public.enforce_single_active_academic_year();

-- ---------------------------------------------------------------------
-- 3. Validasi: reject WAJIB punya alasan (loans & atk_requests)
-- ---------------------------------------------------------------------
create or replace function public.enforce_rejection_reason()
returns trigger language plpgsql as $$
begin
  if new.status = 'rejected' and (new.rejected_reason is null or trim(new.rejected_reason) = '') then
    raise exception 'rejected_reason wajib diisi ketika status diubah menjadi rejected';
  end if;
  return new;
end;
$$;

create trigger trg_loans_rejection_reason
  before update on public.loans
  for each row execute function public.enforce_rejection_reason();

create trigger trg_atk_requests_rejection_reason
  before update on public.atk_requests
  for each row execute function public.enforce_rejection_reason();

-- ---------------------------------------------------------------------
-- 4. Update available_stock pada assets ketika status loan berubah
-- Logika:
--   pending_approval -> approved   : available_stock berkurang
--   approved -> returned           : available_stock bertambah (jika kondisi baik/rusak ringan kembali dipakai)
--   pending_approval -> rejected   : tidak ada perubahan stock (belum pernah dikurangi)
--   approved -> return_requested   : tidak ada perubahan stock (masih di tangan peminjam)
-- ---------------------------------------------------------------------
create or replace function public.apply_stock_on_loan_status_change()
returns trigger language plpgsql security definer as $$
declare
  item record;
begin
  -- Saat disetujui: kurangi available_stock, kunci barang jika stok habis
  if old.status = 'pending_approval' and new.status = 'approved' then
    for item in select asset_id, quantity from public.loan_items where loan_id = new.id loop
      update public.assets
        set available_stock = available_stock - item.quantity,
            status = case when available_stock - item.quantity <= 0 then 'borrowed' else status end
        where id = item.asset_id;
    end loop;
  end if;

  -- Saat barang sudah dicek kondisinya dan dinyatakan selesai (returned)
  if old.status = 'return_requested' and new.status = 'returned' then
    for item in
      select li.asset_id, li.quantity, li.condition_on_return
      from public.loan_items li
      where li.loan_id = new.id
    loop
      -- Hanya kembalikan ke stock tersedia jika kondisi masih layak pakai.
      if item.condition_on_return in ('good', 'minor_damage') then
        update public.assets
          set available_stock = available_stock + item.quantity,
              status = case when available_stock + item.quantity > 0 then 'available' else status end
          where id = item.asset_id;
      else
        -- Rusak berat / hilang: barang tidak kembali ke stock tersedia,
        -- total_stock dikurangi permanen karena barang sudah tidak ada/tidak layak.
        update public.assets
          set total_stock = greatest(total_stock - item.quantity, 0)
          where id = item.asset_id;
      end if;
    end loop;
  end if;

  return new;
end;
$$;

create trigger trg_loan_stock_sync
  after update on public.loans
  for each row execute function public.apply_stock_on_loan_status_change();

-- ---------------------------------------------------------------------
-- 5. Kurangi stock ATK saat request disetujui (fulfilled)
-- ---------------------------------------------------------------------
create or replace function public.apply_stock_on_atk_status_change()
returns trigger language plpgsql security definer as $$
declare
  item record;
begin
  if old.status <> 'fulfilled' and new.status = 'fulfilled' then
    for item in select atk_item_id, quantity from public.atk_request_items where request_id = new.id loop
      update public.atk_items
        set stock = greatest(stock - item.quantity, 0)
        where id = item.atk_item_id;
    end loop;
  end if;
  return new;
end;
$$;

create trigger trg_atk_stock_sync
  after update on public.atk_requests
  for each row execute function public.apply_stock_on_atk_status_change();

-- ---------------------------------------------------------------------
-- 6. Activity log otomatis (dipakai Today's Activity, History, Voice Notif)
-- Frontend HANYA membaca tabel ini via Supabase Realtime — tidak pernah
-- menulis langsung, supaya format log selalu konsisten.
-- ---------------------------------------------------------------------
create or replace function public.log_loan_activity()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_logs (actor_id, action, target_type, target_id, academic_year_id, metadata)
    values (new.borrower_id, 'loan_created', 'loan', new.id, new.academic_year_id, '{}');
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

create trigger trg_log_loan_activity
  after insert or update on public.loans
  for each row execute function public.log_loan_activity();

create or replace function public.log_atk_activity()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_logs (actor_id, action, target_type, target_id, academic_year_id, metadata)
    values (new.requester_id, 'atk_request_created', 'atk_request', new.id, new.academic_year_id, '{}');
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

create trigger trg_log_atk_activity
  after insert or update on public.atk_requests
  for each row execute function public.log_atk_activity();

-- ---------------------------------------------------------------------
-- 7. AUTO PROMOTION
-- Dipanggil manual oleh admin (tombol "Promote Academic Year"), BUKAN trigger
-- otomatis, karena ini aksi sengaja yang butuh konfirmasi admin.
-- Contoh pemanggilan dari aplikasi:
--   select public.promote_academic_year('<uuid_tahun_ajaran_baru>');
-- ---------------------------------------------------------------------
create or replace function public.promote_academic_year(new_academic_year_id uuid)
returns void language plpgsql security definer as $$
declare
  c record;
  new_class_id uuid;
begin
  -- Kelas 12 yang lulus -> jadi alumni, tidak dipindah ke kelas manapun
  update public.students s
    set status = 'alumni', graduated_at = now()
    from public.classes cl
    where s.class_id = cl.id and cl.grade_level = 12 and s.status = 'active';

  -- Kelas 10 dan 11 naik ke tingkat berikutnya
  for c in
    select id, name, grade_level, major
    from public.classes
    where grade_level in (10, 11)
  loop
    -- Cari atau buat kelas tujuan di tahun ajaran baru (nama kelas sama, grade_level + 1)
    select id into new_class_id
    from public.classes
    where academic_year_id = new_academic_year_id
      and grade_level = c.grade_level + 1
      and name = regexp_replace(c.name, '^(XII|XI|X)', case c.grade_level + 1 when 11 then 'XI' when 12 then 'XII' end)
    limit 1;

    if new_class_id is null then
      insert into public.classes (name, grade_level, major, academic_year_id)
      values (
        regexp_replace(c.name, '^(XII|XI|X)', case c.grade_level + 1 when 11 then 'XI' when 12 then 'XII' end),
        c.grade_level + 1, c.major, new_academic_year_id
      )
      returning id into new_class_id;
    end if;

    update public.students
      set class_id = new_class_id
      where class_id = c.id and status = 'active';
  end loop;
end;
$$;

comment on function public.promote_academic_year is
  'Naik kelas massal: X->XI, XI->XII, XII->alumni. Admin memanggil ini lewat tombol "Promote Academic Year" di dashboard, lalu mengaktifkan tahun ajaran baru secara terpisah.';
