import { LegalLayout } from '@/components/legal-layout';

export default function TermsOfServicePage() {
  return (
    <LegalLayout title="Terms of Service">
      <p>
        Terakhir diperbarui: 1 September 2026. Dokumen ini mengatur syarat dan ketentuan penggunaan
        Asset Management System SMA Negeri 1 Cikembar (&ldquo;Layanan&rdquo;) oleh seluruh warga
        sekolah, meliputi siswa, guru, dan admin.
      </p>

      <h2>1. Ruang Lingkup Layanan</h2>
      <p>
        Layanan ini disediakan untuk mempermudah proses peminjaman asset sekolah, permintaan ATK,
        stock opname, dan pelaporan terkait, khusus untuk keperluan internal SMA Negeri 1
        Cikembar. Layanan tidak dimaksudkan untuk penggunaan komersial atau di luar lingkungan
        sekolah.
      </p>

      <h2>2. Akun Pengguna</h2>
      <ul>
        <li>
          Siswa mendaftar mandiri menggunakan data yang valid (nama, kelas, email). Akun Guru dan
          Admin dibuatkan oleh pihak sekolah.
        </li>
        <li>Setiap pengguna bertanggung jawab menjaga kerahasiaan password akunnya sendiri.</li>
        <li>
          Sekolah berhak menonaktifkan akun yang terbukti disalahgunakan, termasuk memberikan data
          palsu saat pendaftaran.
        </li>
      </ul>

      <h2>3. Peminjaman &amp; Pengembalian</h2>
      <ul>
        <li>Setiap pengajuan peminjaman tunduk pada persetujuan (approval) Admin.</li>
        <li>
          Peminjam bertanggung jawab atas kondisi barang selama masa peminjaman dan wajib
          melaporkan kerusakan atau kehilangan secara jujur saat proses pengembalian.
        </li>
        <li>
          Sekolah berhak menetapkan sanksi administratif (misalnya pembatasan sementara hak
          meminjam) atas keterlambatan pengembalian atau kerusakan yang disebabkan kelalaian.
        </li>
      </ul>

      <h2>4. Perubahan Layanan</h2>
      <p>
        Sekolah dapat mengubah, menambah, atau menghentikan sebagian fitur Layanan kapan saja,
        termasuk mengaktifkan Maintenance Mode untuk keperluan pemeliharaan sistem.
      </p>

      <h2>5. Kontak</h2>
      <p>Pertanyaan mengenai ketentuan ini dapat disampaikan langsung kepada Admin sekolah.</p>
    </LegalLayout>
  );
}
