# Discord Bot — Notification Bridge

Bot ini **hanya** mengirim notifikasi approval (Pinjam, Pengembalian, ATK)
ke channel Discord sekolah. Bot ini **tidak** menerima command apa pun dari
Discord — murni satu arah: database → Discord.

Ini adalah project Node.js **terpisah** dari aplikasi Next.js utama (folder
`../` di root repository), karena butuh proses yang berjalan terus-menerus
(bukan serverless seperti Vercel), sehingga di-hosting di tempat berbeda
(Pterodactyl/Wispbyte, bukan Vercel).

---

## Cara Kerja

1. Setiap kali ada pengajuan baru (peminjaman, pengembalian, atau ATK),
   trigger database (`database/08_voice_notification_metadata.sql` dan
   `10_return_activity_metadata.sql` di project utama) menulis baris baru
   ke tabel `activity_logs` — lengkap dengan nama, role, kelas, dan barang.
2. Bot ini mendengarkan (via Supabase Realtime) setiap baris baru masuk
   ke `activity_logs`.
3. Jika jenisnya salah satu dari 3 approval (Pinjam/Pengembalian/ATK),
   bot mengirim Discord Embed rapi ke channel yang sudah ditentukan.

---

## Keandalan (Reliability)

Bot ini dirancang untuk berjalan berbulan-bulan tanpa perlu dipantau manual:

- **Reconnect otomatis Discord**: kalau koneksi ke Discord Gateway putus
  (internet hosting bermasalah sesaat, dll), `discord.js` otomatis
  menyambung ulang. Prosesnya terlihat jelas di log Console
  (`shardDisconnect` → `shardReconnecting` → `shardResume`).
- **Reconnect otomatis Supabase Realtime**: kalau koneksi realtime putus,
  bot mencoba sambung ulang dengan jeda bertahap (1 detik, 2 detik, 5
  detik, 10 detik, sampai maksimal 30 detik) — bukan langsung menyerah.
- **Retry pengiriman pesan**: kalau gagal kirim ke Discord (gangguan
  jaringan sesaat), dicoba lagi otomatis sampai 3 kali sebelum benar-benar
  dianggap gagal.
- **Heartbeat log**: setiap 5 menit, bot menulis log status (Discord
  ready atau tidak, ping, status Realtime) — cek Console kapan saja untuk
  memastikan bot masih hidup.
- **Tidak pernah crash diam-diam**: error yang tidak terduga selalu
  dicatat ke log sebelum proses berhenti, supaya mudah di-diagnosa.
  Disarankan aktifkan opsi **auto-restart** di panel Pterodactyl/Wispbyte
  Anda (biasanya ada di pengaturan server) sebagai jaring pengaman
  tambahan kalau proses benar-benar berhenti.
- **Mention user tertentu** (opsional): isi `DISCORD_MENTION_USER_IDS` di
  `.env` untuk otomatis mention (memicu notifikasi push) orang tertentu
  di setiap approval baru — lihat `.env.example` untuk detailnya.

---

## 🚀 Setup dari Nol

### 1. Buat Aplikasi & Bot di Discord Developer Portal

1. Buka https://discord.com/developers/applications
2. Klik **New Application**, beri nama misalnya "SMA 1 Cikembar Bot".
3. Di sidebar kiri, klik menu **Bot**.
4. Klik **Reset Token** → salin token yang muncul → ini nilai untuk
   `DISCORD_BOT_TOKEN` di file `.env`.
5. Matikan (off) semua **Privileged Gateway Intents** — bot ini tidak
   butuh membaca pesan atau data member, hanya mengirim pesan.

### 2. Undang Bot ke Server Discord Sekolah

1. Di sidebar kiri, klik menu **OAuth2** → **URL Generator**.
2. Di bagian **Scopes**, centang `bot`.
3. Di bagian **Bot Permissions** yang muncul, centang **Send Messages**
   dan **Embed Links** saja (prinsip least-privilege — bot tidak butuh
   izin lain apa pun).
4. Salin URL yang muncul di paling bawah, buka di browser, pilih server
   Discord sekolah, klik **Authorize**.

### 3. Ambil Channel ID

1. Di Discord, buka **User Settings** (ikon gerigi di pojok kiri bawah)
   → **Advanced** → aktifkan **Developer Mode**.
2. Klik-kanan channel tempat notifikasi approval akan muncul → **Copy
   Channel ID** → ini nilai untuk `DISCORD_APPROVAL_CHANNEL_ID`.

### 4. Isi Environment Variable

1. Duplikat `.env.example` menjadi `.env`.
2. Isi keempat variabelnya — penjelasan lengkap ADA di dalam file
   `.env.example` itu sendiri.

### 5. Jalankan di Komputer Lokal (untuk testing)

```
cd discord-bot
npm install
npm start
```

Jika berhasil, terminal menampilkan:
```
[OK] Bot login sebagai NamaBot#1234
[Realtime] Status koneksi: SUBSCRIBED
```

Coba ajukan peminjaman dari aplikasi web — notifikasi akan langsung
muncul di channel Discord dalam hitungan detik.

---

## ☁️ Hosting di Pterodactyl Panel (Wispbyte Free Tier)

Bot ini perlu berjalan 24 jam nonstop, berbeda dari Next.js yang bisa
"tidur" di antara request. Wispbyte menyediakan hosting gratis berbasis
Pterodactyl Panel untuk proses Node.js seperti ini.

1. Daftar akun di penyedia Wispbyte, buat **server baru** dengan tipe
   **Node.js** (biasanya disebut "egg" Node.js di Pterodactyl).
2. Setelah server dibuat, buka tab **File Manager** di panel, upload
   seluruh isi folder `discord-bot/` ini (bisa lewat file manager web,
   atau SFTP menggunakan kredensial yang diberikan panel).
3. Buka tab **Startup**, pastikan:
   - **Startup Command** berisi sesuatu seperti `npm install && npm start`
     (sesuaikan dengan opsi yang tersedia di egg Node.js Wispbyte Anda).
   - Isi keempat environment variable (`SUPABASE_URL`,
     `SUPABASE_SERVICE_ROLE_KEY`, `DISCORD_BOT_TOKEN`,
     `DISCORD_APPROVAL_CHANNEL_ID`) di bagian **Variables** / **Startup**.
4. Klik **Start** di panel. Cek tab **Console** — harus muncul log yang
   sama seperti saat testing lokal (`[OK] Bot login sebagai ...`).

> Catatan: tampilan panel Wispbyte bisa berubah sewaktu-waktu mengikuti
> versi Pterodactyl yang mereka pakai. Jika langkah di atas tidak persis
> sama, cari menu dengan nama serupa ("Startup", "Variables", "Console")
> atau lihat dokumentasi resmi Wispbyte untuk detail terbaru.

---

## Troubleshooting

**Bot online tapi notifikasi tidak muncul:**
- Pastikan file `database/09_realtime_publication.sql` sudah dijalankan
  di Supabase SQL Editor (mengaktifkan Realtime untuk tabel `activity_logs`).
- Cek log console bot — apakah statusnya `SUBSCRIBED`? Jika bukan, cek
  kembali `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`.

**Bot tidak bisa login (`DISCORD_BOT_TOKEN` error):**
- Token mungkin sudah di-reset dari Developer Portal. Reset lagi dan
  perbarui nilai di `.env` / panel Wispbyte.

**Channel tidak ditemukan:**
- Pastikan bot benar-benar sudah diundang ke server yang berisi channel
  tersebut (lihat langkah 2 di atas).
