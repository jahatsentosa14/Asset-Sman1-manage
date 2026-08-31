import { LegalLayout } from '@/components/legal-layout';

export default function DisclaimerPage() {
  return (
    <LegalLayout title="Disclaimer">
      <p>Terakhir diperbarui: 30 Juli 2026.</p>

      <h2>1. Ketersediaan Layanan</h2>
      <p>
        Layanan ini disediakan &ldquo;sebagaimana adanya&rdquo; (as-is). Meskipun dirancang untuk
        andal, sekolah tidak menjamin Layanan akan selalu bebas dari gangguan, kesalahan teknis,
        atau downtime, termasuk namun tidak terbatas pada saat Maintenance Mode aktif.
      </p>

      <h2>2. Akurasi Data</h2>
      <p>
        Status stok, kondisi barang, dan riwayat yang ditampilkan bergantung pada input yang
        diberikan oleh peminjam dan Admin secara jujur dan tepat waktu. Sekolah tidak bertanggung
        jawab atas selisih data yang timbul dari kesalahan input manusia.
      </p>

      <h2>3. Batasan Tanggung Jawab</h2>
      <p>
        Sekolah tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan
        atau ketidaktersediaan Layanan, termasuk namun tidak terbatas pada kehilangan kesempatan
        meminjam barang akibat gangguan teknis.
      </p>

      <h2>4. Layanan Pendukung Pihak Ketiga</h2>
      <p>
        Layanan dapat menggunakan penyedia pihak ketiga untuk fungsi teknis tertentu, seperti
        autentikasi pengguna, penyimpanan dan pemrosesan data, hosting aplikasi, serta pengiriman
        notifikasi. Penyedia tersebut digunakan hanya untuk mendukung operasional Layanan dan
        dapat memiliki kebijakan serta ketentuan layanan masing-masing. Sekolah tidak bertanggung
        jawab atas gangguan yang secara langsung berasal dari layanan pendukung tersebut.
      </p>
    </LegalLayout>
  );
}
