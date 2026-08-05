import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Dipakai di semua komponen shadcn/ui untuk menggabungkan className
// tanpa konflik (misal: className="p-2" ditimpa jadi "p-4" tanpa duplikat).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
