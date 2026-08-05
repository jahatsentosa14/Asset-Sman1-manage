import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ExportData } from './types';

const PAGE_WIDTH = 841.89; // A4 landscape (dalam points)
const PAGE_HEIGHT = 595.28;
const MARGIN = 40;
const ROW_HEIGHT = 20;
const FONT_SIZE = 9;

export async function generatePdf(data: ExportData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const colWidth = (PAGE_WIDTH - MARGIN * 2) / data.columns.length;
  const rowsPerPage = Math.floor((PAGE_HEIGHT - MARGIN * 2 - 60) / ROW_HEIGHT);

  let rowIndex = 0;
  const totalPages = Math.max(1, Math.ceil(data.rows.length / rowsPerPage));

  for (let page = 0; page < totalPages; page++) {
    const pdfPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;

    // Judul (hanya di halaman pertama)
    if (page === 0) {
      pdfPage.drawText(data.title, { x: MARGIN, y, size: 16, font: boldFont });
      y -= 28;
    } else {
      y -= 8;
    }

    // Header kolom
    data.columns.forEach((col, i) => {
      pdfPage.drawText(col.label, {
        x: MARGIN + i * colWidth,
        y,
        size: FONT_SIZE,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      });
    });
    y -= 6;
    pdfPage.drawLine({
      start: { x: MARGIN, y },
      end: { x: PAGE_WIDTH - MARGIN, y },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= ROW_HEIGHT;

    // Baris data untuk halaman ini
    for (let i = 0; i < rowsPerPage && rowIndex < data.rows.length; i++, rowIndex++) {
      const row = data.rows[rowIndex];
      data.columns.forEach((col, colI) => {
        const text = String(row[col.key] ?? '');
        // Potong teks yang terlalu panjang supaya tidak tumpang tindih ke kolom sebelah.
        const truncated = text.length > 28 ? text.slice(0, 25) + '...' : text;
        pdfPage.drawText(truncated, {
          x: MARGIN + colI * colWidth,
          y,
          size: FONT_SIZE,
          font,
          color: rgb(0.15, 0.15, 0.15),
        });
      });
      y -= ROW_HEIGHT;
    }

    pdfPage.drawText(`Halaman ${page + 1} dari ${totalPages}`, {
      x: PAGE_WIDTH - MARGIN - 90,
      y: MARGIN - 20,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  return pdfDoc.save();
}
