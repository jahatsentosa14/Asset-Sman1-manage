import { Document, Packer, Paragraph, Table, TableRow, TableCell, HeadingLevel, WidthType } from 'docx';
import type { ExportData } from './types';

export async function generateDocx(data: ExportData): Promise<Buffer> {
  const headerRow = new TableRow({
    tableHeader: true,
    children: data.columns.map(
      (col) =>
        new TableCell({
          shading: { fill: 'E5E7EB' },
          children: [new Paragraph({ text: col.label, heading: HeadingLevel.HEADING_6 })],
        })
    ),
  });

  const dataRows = data.rows.map(
    (row) =>
      new TableRow({
        children: data.columns.map(
          (col) => new TableCell({ children: [new Paragraph(String(row[col.key] ?? ''))] })
        ),
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: data.title, heading: HeadingLevel.HEADING_2 }),
          new Paragraph({ text: '' }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [headerRow, ...dataRows],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
