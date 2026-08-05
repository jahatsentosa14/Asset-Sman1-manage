export type ExportColumn = { key: string; label: string };
export type ExportRow = Record<string, string | number>;

export type ExportData = {
  title: string;
  columns: ExportColumn[];
  rows: ExportRow[];
};
