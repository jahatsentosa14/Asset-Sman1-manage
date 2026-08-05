export const PAGE_SIZE = 20;

export function parsePage(pageParam: string | undefined): number {
  const page = Number(pageParam);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

export function getPaginationRange(page: number, pageSize: number = PAGE_SIZE): { from: number; to: number } {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

export function getTotalPages(totalCount: number, pageSize: number = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}
