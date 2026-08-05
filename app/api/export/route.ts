import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLoanHistory, getAtkHistory } from '@/services/history';
import { generateCsv } from '@/lib/export/csv';
import { generateXlsx } from '@/lib/export/xlsx';
import { generatePdf } from '@/lib/export/pdf';
import { generateDocx } from '@/lib/export/docx';
import type { ExportData } from '@/lib/export/types';

const LOAN_COLUMNS = [
  { key: 'borrower_name', label: 'Peminjam' },
  { key: 'items_summary', label: 'Barang' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Tanggal Pengajuan' },
  { key: 'returned_at', label: 'Tanggal Kembali' },
];

const ATK_COLUMNS = [
  { key: 'requester_name', label: 'Pemohon' },
  { key: 'items_summary', label: 'Barang' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Tanggal Pengajuan' },
];

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type'); // 'loans' | 'atk'
  const format = searchParams.get('format'); // 'csv' | 'xlsx' | 'pdf' | 'docx'
  const academicYearId = searchParams.get('academicYearId') ?? undefined;

  if (type !== 'loans' && type !== 'atk') {
    return NextResponse.json({ error: 'Parameter type tidak valid' }, { status: 400 });
  }
  if (!['csv', 'xlsx', 'pdf', 'docx'].includes(format ?? '')) {
    return NextResponse.json({ error: 'Parameter format tidak valid' }, { status: 400 });
  }

  const exportData: ExportData =
    type === 'loans'
      ? {
          title: 'Riwayat Peminjaman Asset',
          columns: LOAN_COLUMNS,
          rows: (await getLoanHistory(supabase, academicYearId)).map((r) => ({
            ...r,
            created_at: formatDate(r.created_at),
            returned_at: r.returned_at ? formatDate(r.returned_at) : '-',
          })),
        }
      : {
          title: 'Riwayat Permintaan ATK',
          columns: ATK_COLUMNS,
          rows: (await getAtkHistory(supabase, academicYearId)).map((r) => ({
            ...r,
            created_at: formatDate(r.created_at),
          })),
        };

  const filenameBase = `riwayat-${type}-${new Date().toISOString().slice(0, 10)}`;

  switch (format) {
    case 'csv': {
      const csv = generateCsv(exportData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
        },
      });
    }
    case 'xlsx': {
      const buffer = await generateXlsx(exportData);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filenameBase}.xlsx"`,
        },
      });
    }
    case 'pdf': {
      const pdfBytes = await generatePdf(exportData);
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filenameBase}.pdf"`,
        },
      });
    }
    case 'docx': {
      const buffer = await generateDocx(exportData);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${filenameBase}.docx"`,
        },
      });
    }
    default:
      return NextResponse.json({ error: 'Format tidak didukung' }, { status: 400 });
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
