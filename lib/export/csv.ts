import type { ExportData } from './types';

function escapeCsvValue(value: string | number): string {
  const str = String(value);
  // Bungkus dengan tanda kutip jika mengandung koma, kutip, atau baris baru,
  // sesuai standar format CSV (RFC 4180).
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsv(data: ExportData): string {
  const header = data.columns.map((col) => escapeCsvValue(col.label)).join(',');
  const rows = data.rows.map((row) =>
    data.columns.map((col) => escapeCsvValue(row[col.key] ?? '')).join(',')
  );
  // \uFEFF (BOM) di depan supaya Excel membuka file CSV dengan encoding UTF-8
  // yang benar (tanpa ini, karakter non-ASCII seperti "é" atau "→" bisa rusak).
  return '\uFEFF' + [header, ...rows].join('\r\n');
}
