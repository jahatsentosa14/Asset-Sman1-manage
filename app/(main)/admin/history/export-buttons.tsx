import { FileText, FileSpreadsheet, FileType, FileDown } from 'lucide-react';

const FORMATS = [
  { format: 'csv', label: 'CSV', icon: FileText },
  { format: 'xlsx', label: 'Excel', icon: FileSpreadsheet },
  { format: 'pdf', label: 'PDF', icon: FileType },
  { format: 'docx', label: 'Word', icon: FileDown },
] as const;

export function ExportButtons({ type, academicYearId }: { type: 'loans' | 'atk'; academicYearId?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FORMATS.map(({ format, label, icon: Icon }) => {
        const params = new URLSearchParams({ type, format });
        if (academicYearId) params.set('academicYearId', academicYearId);

        return (
          <a
            key={format}
            href={`/api/export?${params.toString()}`}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
          >
            <Icon size={14} /> {label}
          </a>
        );
      })}
    </div>
  );
}
