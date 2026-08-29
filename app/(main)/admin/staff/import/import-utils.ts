import ExcelJS from 'exceljs';
import type { UserGender } from '@/types/database';

export type ImportTeacherRow = {
  rowNumber: number;
  fullName: string;
  email: string;
  gender: UserGender;
  password: string;
};

export type ImportTeacherResult = {
  rows: ImportTeacherRow[];
  errors: string[];
};

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }

  if (value instanceof Date) {
    return value.toISOString().trim();
  }

  if (typeof value === 'object') {
    const cellValue = value as {
      richText?: Array<{ text?: string }>;
      text?: string;
      result?: unknown;
      hyperlink?: string;
    };

    if (Array.isArray(cellValue.richText)) {
      return cellValue.richText
        .map((part) => part.text ?? '')
        .join('')
        .trim();
    }

    if (typeof cellValue.text === 'string') {
      return cellValue.text.trim();
    }

    if (cellValue.result !== undefined) {
      return normalizeText(cellValue.result);
    }

    if (typeof cellValue.hyperlink === 'string') {
      return cellValue.hyperlink.trim();
    }
  }

  return String(value).trim();
}

function normalizeEmail(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

function parseGender(value: unknown): UserGender | null {
  const gender = normalizeText(value).toUpperCase();

  if (gender === 'L' || gender === 'LAKI-LAKI' || gender === 'LAKI LAKI') {
    return 'male';
  }

  if (gender === 'P' || gender === 'PEREMPUAN') {
    return 'female';
  }

  return null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function parseTeacherExcel(
  file: ArrayBuffer
): Promise<ImportTeacherResult> {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(file);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    return {
      rows: [],
      errors: ['File Excel tidak memiliki worksheet.'],
    };
  }

  const headerRow = worksheet.getRow(1);

 const headers: string[] = [];

headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
  headers[colNumber - 1] = normalizeText(cell.value).toLowerCase();
});

  const requiredHeaders = ['nama', 'email', 'jenis kelamin', 'password awal'];

  const missingHeaders = requiredHeaders.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    return {
      rows: [],
      errors: [
        `Kolom wajib tidak ditemukan: ${missingHeaders.join(', ')}.`,
      ],
    };
  }

  const columnIndex = {
    nama: headers.indexOf('nama') + 1,
    email: headers.indexOf('email') + 1,
    gender: headers.indexOf('jenis kelamin') + 1,
    password: headers.indexOf('password awal') + 1,
  };

  const rows: ImportTeacherRow[] = [];
  const errors: string[] = [];
  const emails = new Map<string, number>();

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const fullName = normalizeText(row.getCell(columnIndex.nama).value);
    const email = normalizeEmail(row.getCell(columnIndex.email).value);
    const genderValue = normalizeText(
      row.getCell(columnIndex.gender).value
    );
    const password = normalizeText(
      row.getCell(columnIndex.password).value
    );

    // Lewati baris kosong.
    if (!fullName && !email && !genderValue && !password) {
      return;
    }

    let rowHasError = false;

    if (!fullName) {
      errors.push(`Baris ${rowNumber}: Nama wajib diisi.`);
      rowHasError = true;
    } else if (fullName.length < 3) {
      errors.push(
        `Baris ${rowNumber}: Nama minimal 3 karakter.`
      );
      rowHasError = true;
    }

    if (!email) {
      errors.push(`Baris ${rowNumber}: Email wajib diisi.`);
      rowHasError = true;
    } else if (!isValidEmail(email)) {
      errors.push(
        `Baris ${rowNumber}: Format email tidak valid (${email}).`
      );
      rowHasError = true;
    }

    const gender = parseGender(genderValue);

    if (!gender) {
      errors.push(
        `Baris ${rowNumber}: Jenis kelamin harus L atau P.`
      );
      rowHasError = true;
    }

    if (!password) {
      errors.push(
        `Baris ${rowNumber}: Password awal wajib diisi.`
      );
      rowHasError = true;
    } else if (password.length < 8) {
      errors.push(
        `Baris ${rowNumber}: Password minimal 8 karakter.`
      );
      rowHasError = true;
    }

    if (email) {
      const previousRow = emails.get(email);

      if (previousRow) {
        errors.push(
          `Baris ${rowNumber}: Email ${email} duplikat dengan baris ${previousRow}.`
        );
        rowHasError = true;
      } else {
        emails.set(email, rowNumber);
      }
    }

    if (!rowHasError && gender) {
      rows.push({
        rowNumber,
        fullName,
        email,
        gender,
        password,
      });
    }
  });

  return {
    rows,
    errors,
  };
}
