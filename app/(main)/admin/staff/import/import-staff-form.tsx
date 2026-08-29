'use client';

import { useState } from 'react';
import { importTeacherAccountsAction, type BulkImportState } from './actions';
import { parseTeacherExcel, type ImportTeacherRow } from './import-utils';

const initialState: BulkImportState = { error: null, success: 0, failed: [] };

export function ImportStaffForm() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportTeacherRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkImportState>(initialState);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    setFile(selectedFile ?? null);
    setRows([]);
    setErrors([]);
    setResult(initialState);

    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
      setErrors(['File harus berformat .xlsx']);
      return;
    }

    setLoading(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const parsed = await parseTeacherExcel(buffer);
      setRows(parsed.rows);
      setErrors(parsed.errors);
    } catch (error) {
      console.error(error);
      setErrors(['File Excel tidak dapat dibaca. Pastikan file tidak rusak dan menggunakan format .xlsx.']);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    if (rows.length === 0 || submitting) return;
    setSubmitting(true);
    setResult(initialState);

    try {
      const formData = new FormData();
      formData.set('teachers', JSON.stringify(rows));
      const response = await importTeacherAccountsAction(initialState, formData);
      setResult(response);
    } catch (error) {
      console.error(error);
      setResult({ error: 'Import gagal. Silakan coba lagi.', success: 0, failed: [] });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Upload File Excel</h2>
        <p className="mt-1 text-sm text-muted-foreground">Format kolom: Nama, Email, Jenis Kelamin, Password awal.</p>
        <div className="mt-4">
          <input type="file" accept=".xlsx" onChange={handleFileChange} disabled={loading || submitting} className="block w-full text-sm" />
        </div>
        {file && <p className="mt-3 text-sm text-muted-foreground">File: <span className="font-medium">{file.name}</span></p>}
      </div>

      {loading && <div className="rounded-xl border border-border p-6 text-sm">Membaca dan memvalidasi Excel...</div>}

      {errors.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="font-semibold text-destructive">Ditemukan masalah</h2>
          <ul className="mt-3 space-y-1 text-sm text-destructive">
            {errors.map((error, index) => <li key={`${error}-${index}`}>• {error}</li>)}
          </ul>
        </div>
      )}

      {rows.length > 0 && errors.length === 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-semibold">Preview Data</h2>
            <p className="mt-1 text-sm text-muted-foreground">{rows.length} data siap diproses.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium">Baris</th><th className="px-4 py-3 font-medium">Nama</th><th className="px-4 py-3 font-medium">Email</th><th className="px-4 py-3 font-medium">Jenis Kelamin</th>
              </tr></thead>
              <tbody>{rows.map((row) => <tr key={row.rowNumber} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{row.rowNumber}</td><td className="px-4 py-3 font-medium">{row.fullName}</td><td className="px-4 py-3">{row.email}</td><td className="px-4 py-3">{row.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="border-t border-border p-6">
            <button type="button" onClick={handleImport} disabled={submitting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
              {submitting ? 'Membuat Akun...' : `Buat ${rows.length} Akun Guru`}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">Semua data pada preview akan diproses sebagai akun Guru.</p>
          </div>
        </div>
      )}

      {result.success > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 text-sm">Berhasil membuat <strong>{result.success}</strong> akun guru.</div>
      )}
      {result.failed.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          <h2 className="font-semibold">Sebagian data gagal diproses</h2>
          <ul className="mt-3 space-y-1">{result.failed.map((error, index) => <li key={`${error}-${index}`}>• {error}</li>)}</ul>
        </div>
      )}
      {result.error && <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">{result.error}</div>}

      {!loading && file && rows.length === 0 && errors.length === 0 && <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Tidak ada data guru yang ditemukan.</div>}
    </div>
  );
}
