import ExcelJS from 'exceljs';
import type { ExportData } from './types';

export async function generateXlsx(data: ExportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SMA Negeri 1 Cikembar — Asset Management System';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(data.title.slice(0, 31)); // Excel batasi nama sheet max 31 karakter

  sheet.columns = data.columns.map((col) => ({ header: col.label, key: col.key, width: 22 }));
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };

  data.rows.forEach((row) => sheet.addRow(row));

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
