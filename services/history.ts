import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, LoanStatus, AtkRequestStatus } from '@/types/database';

export type LoanHistoryRow = {
  id: string;
  borrower_name: string;
  items_summary: string;
  status: LoanStatus;
  created_at: string;
  returned_at: string | null;
};

export type AtkHistoryRow = {
  id: string;
  requester_name: string;
  items_summary: string;
  status: AtkRequestStatus;
  created_at: string;
};

type RawLoanRow = {
  id: string;
  status: LoanStatus;
  created_at: string;
  returned_at: string | null;
  profiles: { full_name: string } | null;
  loan_items: { quantity: number; assets: { name: string } | null }[];
};

type RawAtkRow = {
  id: string;
  status: AtkRequestStatus;
  created_at: string;
  profiles: { full_name: string } | null;
  atk_request_items: { quantity: number; atk_items: { name: string } | null }[];
};

export async function getLoanHistory(
  supabase: SupabaseClient<Database>,
  academicYearId?: string
): Promise<LoanHistoryRow[]> {
  let query = supabase
    .from('loans')
    .select(
      `id, status, created_at, returned_at,
       profiles!loans_borrower_id_fkey ( full_name ),
       loan_items ( quantity, assets ( name ) )`
    )
    .order('created_at', { ascending: false });

  if (academicYearId) query = query.eq('academic_year_id', academicYearId);

  const { data, error } = await query.returns<RawLoanRow[]>();
  if (error) throw error;

  return (data ?? []).map(mapLoanRow);
}

// Versi berpaginasi — dipakai HANYA untuk tampilan halaman History
// (bukan Export, yang tetap butuh seluruh data lewat getLoanHistory di atas).
export async function getLoanHistoryPage(
  supabase: SupabaseClient<Database>,
  { academicYearId, from, to }: { academicYearId?: string; from: number; to: number }
): Promise<{ rows: LoanHistoryRow[]; totalCount: number }> {
  let query = supabase
    .from('loans')
    .select(
      `id, status, created_at, returned_at,
       profiles!loans_borrower_id_fkey ( full_name ),
       loan_items ( quantity, assets ( name ) )`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (academicYearId) query = query.eq('academic_year_id', academicYearId);

  const { data, error, count } = await query.returns<RawLoanRow[]>();
  if (error) throw error;

  return { rows: (data ?? []).map(mapLoanRow), totalCount: count ?? 0 };
}

function mapLoanRow(loan: RawLoanRow): LoanHistoryRow {
  return {
    id: loan.id,
    borrower_name: loan.profiles?.full_name ?? '-',
    items_summary: loan.loan_items.map((i) => `${i.assets?.name} (${i.quantity})`).join(', '),
    status: loan.status,
    created_at: loan.created_at,
    returned_at: loan.returned_at,
  };
}

export async function getAtkHistory(
  supabase: SupabaseClient<Database>,
  academicYearId?: string
): Promise<AtkHistoryRow[]> {
  let query = supabase
    .from('atk_requests')
    .select(
      `id, status, created_at,
       profiles!atk_requests_requester_id_fkey ( full_name ),
       atk_request_items ( quantity, atk_items ( name ) )`
    )
    .order('created_at', { ascending: false });

  if (academicYearId) query = query.eq('academic_year_id', academicYearId);

  const { data, error } = await query.returns<RawAtkRow[]>();
  if (error) throw error;

  return (data ?? []).map(mapAtkRow);
}

// Versi berpaginasi untuk tampilan halaman History.
export async function getAtkHistoryPage(
  supabase: SupabaseClient<Database>,
  { academicYearId, from, to }: { academicYearId?: string; from: number; to: number }
): Promise<{ rows: AtkHistoryRow[]; totalCount: number }> {
  let query = supabase
    .from('atk_requests')
    .select(
      `id, status, created_at,
       profiles!atk_requests_requester_id_fkey ( full_name ),
       atk_request_items ( quantity, atk_items ( name ) )`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (academicYearId) query = query.eq('academic_year_id', academicYearId);

  const { data, error, count } = await query.returns<RawAtkRow[]>();
  if (error) throw error;

  return { rows: (data ?? []).map(mapAtkRow), totalCount: count ?? 0 };
}

function mapAtkRow(req: RawAtkRow): AtkHistoryRow {
  return {
    id: req.id,
    requester_name: req.profiles?.full_name ?? '-',
    items_summary: req.atk_request_items.map((i) => `${i.atk_items?.name} (${i.quantity})`).join(', '),
    status: req.status,
    created_at: req.created_at,
  };
}
