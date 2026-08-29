'use client';

import { useState } from 'react';
import {
  parseTeacherExcel,
  type ImportTeacherRow,
} from './import-utils';

export function ImportStaffForm() {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportTeacherRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    setFile(selectedFile ?? null);
    setRows([]);
    setErrors([]);

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.xlsx')) {
      setErrors(['File harus berformat .xlsx']);
      return;
    }

    setLoading(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const result = await parseTeacherExcel(buffer);

      setRows(result.rows);
      setErrors(result.errors);
    } catch (error) {
      console.error(error);
      setErrors([
        'File Excel tidak dapat dibaca. Pastikan file tidak rusak dan menggunakan format .xlsx.',
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">
          Upload File Excel
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Format kolom: Nama, Email, Jenis Kelamin, Password awal.
        </p>

        <div className="mt-4">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            disabled={loading}
            className="block w-full text-sm"
          />
        </div>

        {file && (
          <p className="mt-3 text-sm text-muted-foreground">
            File: <span className="font-medium">{file.name}</span>
          </p>
        )}
      </div>

      {loading && (
        <div className="rounded-xl border border-border p-6 text-sm">
          Membaca dan memvalidasi Excel...
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="font-semibold text-destructive">
            Ditemukan masalah
          </h2>

          <ul className="mt-3 space-y-1 text-sm text-destructive">
            {errors.map((error, index) => (
              <li key={`${error}-${index}`}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {rows.length > 0 && (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-6">
            <h2 className="text-lg font-semibold">
              Preview Data
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {rows.length} data siap diproses.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-medium">Baris</th>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">
                    Jenis Kelamin
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.rowNumber}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.rowNumber}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {row.fullName}
                    </td>
                    <td className="px-4 py-3">
                      {row.email}
                    </td>
                    <td className="px-4 py-3">
                      {row.gender === 'male'
                        ? 'Laki-laki'
                        : 'Perempuan'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && file && rows.length === 0 && errors.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Tidak ada data guru yang ditemukan.
        </div>
      )}
    </div>
  );
}
