import { LegalLayout } from '@/components/legal-layout';

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        Terakhir diperbarui: 30 Juli 2026. Kebijakan ini menjelaskan data pribadi apa saja yang
        dikumpulkan Asset Management System SMA Negeri 1 Cikembar dan bagaimana data tersebut
        digunakan.
      </p>

      <h2>1. Data yang Dikumpulkan</h2>
      <ul>
        <li>Nama lengkap, email, jenis kelamin, dan (untuk siswa) kelas serta NISN.</li>
        <li>Foto profil, jika diunggah pengguna secara sukarela.</li>
        <li>
          Riwayat aktivitas: pengajuan peminjaman, permintaan ATK, dan status approval terkait.
        </li>
        <li>Password disimpan dalam bentuk terenkripsi (hash) oleh Supabase Auth — tidak pernah
          disimpan atau ditampilkan dalam bentuk teks biasa, termasuk kepada Admin sekolah.</li>
      </ul>

      <h2>2. Penggunaan Data</h2>
      <p>
        Data digunakan semata-mata untuk menjalankan fungsi inti Layanan: memproses peminjaman,
        menampilkan riwayat, mengirim notifikasi approval (termasuk ke Discord Bot internal
        sekolah), dan menyusun laporan yang dapat diakses Admin.
      </p>

      <h2>3. Penyimpanan &amp; Keamanan</h2>
      <ul>
        <li>Data disimpan di Supabase (PostgreSQL) dengan Row Level Security aktif di setiap tabel.</li>
        <li>Gambar (foto profil, foto barang) disimpan di Supabase Storage.</li>
        <li>Data alumni tidak pernah dihapus, sesuai kebutuhan pencatatan riwayat sekolah.</li>
      </ul>

      <h2>4. Berbagi Data ke Pihak Ketiga</h2>
      <p>
        Data tidak dibagikan ke pihak ketiga untuk tujuan komersial. Notifikasi approval dikirim
        ke channel Discord internal sekolah semata-mata untuk mempercepat proses persetujuan oleh
        Admin, hanya berisi nama, role, kelas, dan nama barang — tidak termasuk email atau
        password.
      </p>

      <h2>5. Hak Pengguna</h2>
      <p>
        Pengguna dapat memperbarui nama dan foto profil sendiri kapan saja melalui halaman
        Settings. Permintaan penghapusan data lebih lanjut dapat diajukan langsung kepada Admin
        sekolah.
      </p>
    </LegalLayout>
  );
}
