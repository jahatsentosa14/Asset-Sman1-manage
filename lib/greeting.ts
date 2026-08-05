import type { UserGender, UserRole } from '@/types/database';

function timeOfDayId(): 'pagi' | 'siang' | 'sore' | 'malam' {
  // WAJIB eksplisit Asia/Jakarta — server (misal Vercel) belum tentu
  // berjalan di zona waktu WIB, jadi new Date().getHours() bisa salah
  // total (contoh: "Selamat Pagi" muncul jam 8 malam WIB).
  const hour = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', hour: 'numeric', hour12: false }).format(new Date())
  );
  if (hour < 11) return 'pagi';
  if (hour < 15) return 'siang';
  if (hour < 19) return 'sore';
  return 'malam';
}

function firstName(fullName: string) {
  return fullName.split(' ')[0];
}

const STUDENT_OPENERS = ['Hey', 'Yo', 'Hai', 'Halo'];
const STUDENT_CLOSERS = [
  'siap buat hari yang produktif? 🚀',
  'ada yang mau di-pinjam hari ini? ✨',
  'gaskeun, mumpung masih pagi. 💪',
  'let\'s get things done hari ini!',
];

export function getGreeting(role: UserRole, gender: UserGender, fullName: string): { title: string; subtitle: string } {
  const name = firstName(fullName);
  const time = timeOfDayId();

  if (role === 'student') {
    // Gen-Z, friendly, campuran Bahasa Inggris — sesuai requirement.
    const opener = STUDENT_OPENERS[new Date().getDate() % STUDENT_OPENERS.length];
    const closer = STUDENT_CLOSERS[new Date().getDate() % STUDENT_CLOSERS.length];
    return {
      title: `${opener}, ${name}! 👋`,
      subtitle: closer,
    };
  }

  if (role === 'teacher') {
    // Formal, hormat, Bahasa Indonesia baku.
    const honorific = gender === 'female' ? 'Ibu' : 'Bapak';
    return {
      title: `Selamat ${time}, ${honorific} ${name}.`,
      subtitle: 'Berikut ringkasan layanan yang tersedia untuk Anda hari ini.',
    };
  }

  if (role === 'super_admin') {
    return {
      title: `Selamat ${time}, ${name}.`,
      subtitle: 'System overview — seluruh modul aplikasi dapat diakses dari Admin Dashboard.',
    };
  }

  // admin — profesional, singkat.
  return {
    title: `Selamat ${time}, ${name}.`,
    subtitle: 'Apa yang ingin Anda lakukan hari ini?',
  };
}
