import { LegalLayout } from '@/components/legal-layout';

export default function TermsOfUsePage() {
  return (
    <LegalLayout title="Terms of Use">
      <p>
        Terakhir diperbarui: 30 Juli 2026. Halaman ini menjelaskan aturan penggunaan yang wajar
        dan tidak wajar atas Asset Management System SMA Negeri 1 Cikembar.
      </p>

      <h2>1. Penggunaan yang Diizinkan</h2>
      <ul>
        <li>Mengajukan peminjaman asset dan permintaan ATK untuk keperluan resmi sekolah.</li>
        <li>Memantau riwayat dan status pengajuan milik sendiri.</li>
        <li>Mengunggah foto profil dan data pribadi yang akurat di halaman Settings.</li>
      </ul>

      <h2>2. Penggunaan yang Dilarang</h2>
      <ul>
        <li>Membuat akun palsu atau mengajukan peminjaman atas nama orang lain tanpa izin.</li>
        <li>Mengunggah gambar yang tidak pantas, melanggar hukum, atau melanggar hak cipta.</li>
        <li>
          Mencoba mengakses, mengubah, atau merusak data yang bukan miliknya, termasuk mencoba
          melewati (bypass) sistem approval atau Row Level Security aplikasi.
        </li>
        <li>Menggunakan Layanan untuk tujuan di luar kegiatan resmi sekolah.</li>
      </ul>

      <h2>3. Konten Pengguna</h2>
      <p>
        Foto profil dan data lain yang diunggah pengguna tetap menjadi tanggung jawab pengguna
        yang bersangkutan. Sekolah berhak menghapus konten yang melanggar ketentuan ini tanpa
        pemberitahuan sebelumnya.
      </p>

      <h2>4. Penangguhan Akses</h2>
      <p>
        Pelanggaran atas ketentuan penggunaan ini dapat mengakibatkan penangguhan akun secara
        sementara maupun permanen, sesuai kebijakan Admin sekolah.
      </p>
    </LegalLayout>
  );
}
