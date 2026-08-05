# Asset Management System — SMA Negeri 1 Cikembar

Sistem peminjaman asset, ATK, dan stock opname berbasis web.

Powered by Loonareen Studios.

---

## 📌 Status Project

Lihat bagian **Progress Project** di percakapan Claude untuk status paling baru.
File ini akan terus diperbarui seiring pembangunan project.

---

## 🗂️ Struktur Folder

```
app/                  → Semua halaman & routing (Next.js App Router)
  (auth)/             → Halaman login, register, dan server actions auth
  ...                 → Halaman lain menyusul (home, asset, atk, admin, dst)
components/           → Komponen UI yang dipakai berulang kali
  ui/                 → Komponen dasar dari shadcn/ui (button, input, dst)
lib/                  → Kode bantu: koneksi Supabase, validasi, utilitas
  supabase/           → Client Supabase untuk browser & server
  validations/        → Skema validasi form (Zod)
hooks/                → Custom React hooks
services/             → Fungsi pemanggil data (query Supabase per fitur)
types/                → Definisi TypeScript, termasuk cermin schema database
database/             → File SQL: schema, RLS, functions, seed data
documentation/        → Dokumentasi tambahan (akan bertambah)
public/               → Asset statis (favicon, dst)
```

---

## 🚀 Cara Install & Menjalankan Project (dari NOL)

Panduan ini mengasumsikan Anda BELUM PERNAH memakai Git, GitHub, Node.js,
atau Next.js sebelumnya.

### 1. Install Node.js

1. Buka https://nodejs.org
2. Download versi **LTS** (yang direkomendasikan, bukan "Current").
3. Install seperti install aplikasi biasa (Next, Next, Finish).
4. Cek berhasil: buka Terminal (Mac) atau Command Prompt (Windows), ketik:
   ```
   node -v
   ```
   Jika muncul angka versi (misal `v20.15.0`), berarti berhasil.

### 2. Install Git

1. Buka https://git-scm.com/downloads
2. Download sesuai OS Anda, install dengan pengaturan default (Next terus).
3. Cek berhasil:
   ```
   git --version
   ```

### 3. Buat Repository GitHub &amp; Ambil Kode Project

Jika Anda menerima project ini sebagai folder/zip (misalnya dari sesi chat
ini), unggah dulu ke GitHub sebelum bisa di-deploy ke Vercel:

1. Buka https://github.com, login atau daftar akun jika belum punya.
2. Klik tombol **+** di pojok kanan atas → **New repository**.
3. Isi **Repository name** (contoh: `sma1-cikembar-asset-management`),
   pilih **Private** (data sekolah tidak untuk publik), lalu klik
   **Create repository**. Jangan centang "Add a README file" karena
   project ini sudah punya.
4. Di komputer Anda, buka Terminal/Command Prompt, masuk ke folder
   project hasil extract zip, lalu jalankan:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <URL_REPOSITORY_DARI_GITHUB_ANDA>
   git push -u origin main
   ```
   URL repository bisa disalin dari halaman repository GitHub yang baru
   dibuat (tombol hijau **Code**).

Untuk sesi selanjutnya (setelah repository ada), cukup:
```
git clone <url-repository-github-anda>
cd <nama-folder-project>
```

### 4. Install Semua Dependency (Library) Project

Masih di Terminal/Command Prompt, di dalam folder project, jalankan:

```
npm install
```

Tunggu sampai selesai (bisa beberapa menit). Ini mengunduh semua
"library" (kode siap pakai) yang tertulis di `package.json`.

### 5. Siapkan Environment Variable

1. Duplikat file `.env.example`, ganti nama duplikatnya menjadi `.env.local`.
2. Isi setiap baris di `.env.local` — penjelasan lengkap ADA di dalam
   file `.env.example` itu sendiri (dijelaskan fungsi, asal nilai, dan
   cara mendapatkannya untuk SETIAP variabel).
3. Cara mendapatkan nilai Supabase dijelaskan detail di bagian
   **"Setup Supabase"** di bawah.

### 6. Jalankan Project di Komputer Anda (Local)

```
npm run dev
```

Buka browser, akses: http://localhost:3000

Jika halaman landing muncul, project berjalan dengan benar.

---

## 🗄️ Setup Supabase (Database & Auth)

Supabase adalah layanan yang menyediakan database PostgreSQL, sistem
login (Auth), dan penyimpanan file (Storage) — semuanya gratis untuk
skala sekolah.

### 1. Buat Akun & Project

1. Buka https://supabase.com → klik **Start your project**.
2. Login/daftar pakai akun GitHub Anda.
3. Klik **New Project**.
4. Isi:
   - **Name**: `sma1-cikembar-asset` (atau nama bebas).
   - **Database Password**: buat password kuat, **SIMPAN BAIK-BAIK**
     (dipakai jika suatu saat perlu akses database langsung).
   - **Region**: pilih yang terdekat, misal `Southeast Asia (Singapore)`.
5. Klik **Create new project**, tunggu ± 2 menit sampai selesai disiapkan.

### 2. Ambil URL & Anon Key (untuk `.env.local`)

1. Di dashboard project, buka menu **Settings** (ikon gerigi) → **API**.
2. Salin **Project URL** → tempel ke `NEXT_PUBLIC_SUPABASE_URL`.
3. Salin key di baris **anon public** → tempel ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Salin key di baris **service_role** → tempel ke `SUPABASE_SERVICE_ROLE_KEY`
   (hati-hati, jangan pernah dibagikan ke siapa pun / commit ke GitHub).

### 3. Jalankan File SQL (Membuat Struktur Database)

1. Di dashboard Supabase, buka menu **SQL Editor** (ikon `</>`) di sidebar kiri.
2. Klik **New query**.
3. Buka file `database/01_schema.sql` di komputer Anda, salin SELURUH isinya,
   tempel di SQL Editor, lalu klik **Run** (atau tekan Ctrl+Enter).
4. Ulangi langkah yang sama untuk (URUTAN INI PENTING, jangan dibalik):
   - `database/02_rls_policies.sql`
   - `database/03_functions.sql`
   - `database/04_seed.sql`
   - `database/05_school_information.sql`
   - `database/07_system_settings.sql`
   - `database/08_voice_notification_metadata.sql`
   - `database/09_realtime_publication.sql`
   - `database/10_return_activity_metadata.sql`
   - `database/11_fix_registration_rls.sql`
   - `database/12_demo_seed.sql` **(opsional — data contoh untuk testing:
     36 kelas, contoh asset & ATK. Skip jika ingin mulai dari data kosong.)**
   - `database/13_maintenance_mode_v2.sql`
   - `database/14_maintenance_activity_log.sql`
   - `database/15_login_rate_limit.sql`
5. Setelah semua berhasil (tidak ada tulisan merah "error"), buka menu
   **Table Editor** di sidebar — Anda akan melihat semua tabel sudah
   terbentuk (profiles, assets, loans, dst).
6. **Lanjutkan ke langkah 4 di bawah (Buat Storage Bucket) dahulu**,
   baru setelah itu kembali jalankan `database/06_storage_policies.sql`
   di SQL Editor — file ini mengatur siapa boleh upload/hapus file di
   tiap bucket, jadi bucket-nya harus sudah ada lebih dulu.

### 4. Buat Storage Bucket

1. Buka menu **Storage** di sidebar.
2. Buat 4 bucket berikut (klik **New bucket** untuk masing-masing):
   - `profile-pictures` (public)
   - `school-information` (public)
   - `asset-images` (public)
   - `atk-images` (public)
3. Untuk masing-masing, aktifkan toggle **Public bucket** saat membuatnya
   (supaya gambar bisa ditampilkan langsung di website tanpa login).
4. Setelah keempat bucket ini dibuat, kembali ke **SQL Editor** dan
   jalankan `database/06_storage_policies.sql` (lihat langkah 3.6 di atas).

> Kenapa 4 bucket terpisah? Supaya rapi dan mudah diatur hak aksesnya
> masing-masing, sesuai requirement project.

### 5. WAJIB: Buat Akun Super Admin Pertama

Tanpa langkah ini, **tidak ada satu pun** yang bisa mengakses Admin
Dashboard, karena semua akun baru (lewat `/register`) otomatis berperan
`student`. Super Admin pertama harus dibuat manual, satu kali saja:

1. Buka Dashboard Supabase → menu **Authentication** → **Users**.
2. Klik **Add user** → **Create new user**.
3. Isi email dan password, **centang "Auto Confirm User"** (supaya tidak
   perlu konfirmasi email), lalu klik **Create user**.
4. Salin **User UID** yang muncul di daftar user (klik user tsb untuk
   melihat UID lengkapnya).
5. Buka **SQL Editor**, jalankan (ganti `GANTI_UUID_INI` dan nama):
   ```sql
   insert into public.profiles (id, full_name, role, gender)
   values ('GANTI_UUID_INI', 'Nama Anda', 'super_admin', 'male');
   ```
6. Login ke aplikasi pakai email & password yang baru dibuat — Anda
   sekarang punya akses penuh ke Admin Dashboard, termasuk halaman
   "Kelola Akun Guru & Admin" untuk membuat akun Guru/Admin lain
   selanjutnya (tidak perlu lagi lewat SQL manual setelah ini).


### 6. WAJIB: Matikan "Confirm Email" untuk Registrasi Siswa

Secara default, Supabase mewajibkan user mengklik link konfirmasi di
email sebelum akun aktif. Untuk aplikasi internal sekolah ini, hal itu
menyebabkan dua masalah:

- Siswa yang baru daftar **tidak langsung bisa dipakai** (harus cek
  email dulu, sering ke folder spam, atau emailnya bahkan tidak valid).
- Supabase free tier punya **rate limit pengiriman email** yang sangat
  ketat (hanya beberapa email per jam) — kalau banyak siswa daftar
  bersamaan, sebagian akan gagal tanpa pesan error yang jelas.

**Wajib matikan** pengaturan ini sebelum go-live:

1. Buka Dashboard Supabase → menu **Authentication** di sidebar →
   **Providers**.
2. Klik provider **Email**.
3. Matikan (off) toggle **Confirm email**.
4. Klik **Save**.

Setelah ini, akun siswa yang baru mendaftar langsung aktif dan bisa
langsung login tanpa perlu cek email.

> Guru dan Admin tidak terpengaruh pengaturan ini — akun mereka dibuat
> langsung oleh Admin lewat halaman "Buat Akun Guru/Admin" dengan
> `email_confirm: true`, jadi selalu langsung aktif.

---

## ☁️ Setup Vercel (Deployment)

Vercel adalah tempat website ini "online" agar bisa diakses semua orang
lewat internet, gratis untuk kebutuhan sekolah.

Panduan lengkap langkah demi langkah (buat akun, import project, isi
Environment Variable, deploy, sampai pakai domain sendiri) ada di
**[`documentation/deployment.md`](./documentation/deployment.md)**.

---

## 🤖 Discord Bot

Discord Bot adalah project Node.js **terpisah** di folder [`discord-bot/`](./discord-bot),
karena butuh proses yang berjalan terus-menerus (di-hosting di Pterodactyl/
Wispbyte), berbeda dari Next.js yang di-hosting di Vercel.

Panduan lengkap dari nol (Discord Developer Portal, undang bot, hosting
di Pterodactyl/Wispbyte) ada di **[`discord-bot/README.md`](./discord-bot/README.md)**.

---

## 🔄 Cara Update Project

Setiap ada perubahan kode baru dari saya (Claude):

```
git pull
npm install
```

`git pull` mengambil kode terbaru. `npm install` memastikan jika ada
library baru yang ditambahkan, ikut ter-install.

---

## 💾 Cara Backup & Restore Database

Panduan lengkap (export lewat Dashboard Supabase, `pg_dump`, dan cara
restore) ada di **[`documentation/backup-restore.md`](./documentation/backup-restore.md)**.

---

## 🔐 Keamanan yang Sudah Diterapkan

- **Row Level Security (RLS)**: setiap tabel punya aturan siapa boleh
  baca/tulis baris mana. Detail lengkap ada di komentar
  `database/02_rls_policies.sql`.
- **Validasi input**: semua form divalidasi pakai Zod baik di sisi
  pengisian maupun sebelum data masuk ke server (`lib/validations/`).
- **Service Role Key** tidak pernah dipakai di kode yang berjalan di
  browser — hanya di server.
- **Password** dikelola sepenuhnya oleh Supabase Auth (di-hash,
  tidak pernah disimpan dalam bentuk teks biasa).

---

## ⚠️ Catatan Keamanan Penting

Project ini memakai **Next.js 14** (versi patch terbaru di jalur 14.x: 14.2.35).
Sudah dicek dengan `npm audit`: seluruh kerentanan yang bisa diperbaiki tanpa
breaking change (Supabase auth-js, cookie parsing) sudah diperbaiki.

Namun, Next.js 14 sudah memasuki masa akhir dukungan penuh — beberapa
kerentanan tingkat **high** (terkait Server Actions, cache, dan Image
Optimizer) hanya diperbaiki di **Next.js 15/16**. Migrasi ke Next.js 15/16
butuh perubahan pada banyak file (API `cookies()`/`headers()`/`params` berubah
jadi asynchronous) sehingga sengaja TIDAK dilakukan diam-diam di sesi ini —
ini akan dikerjakan sebagai satu sesi migrasi terpisah dengan pengujian
menyeluruh, bukan disisipkan di tengah fitur lain.

Ada juga 1 kerentanan **moderate** (severity rendah) pada dependency `uuid`
yang dipakai secara internal oleh `exceljs` (untuk fitur export Excel) — belum
ada perbaikan resmi dari upstream per saat ini, dan risikonya rendah karena
tidak ada input pengguna yang mengalir ke fungsi yang rentan tersebut.

Jalankan `npm audit` kapan saja untuk melihat status terbaru.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| UI Components | shadcn/ui |
| Backend | Next.js Server Actions |
| Database | PostgreSQL (Supabase) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Storage | Supabase Storage |
| Deployment | Vercel |
| Discord Bot | discord.js (di-host di Pterodactyl/Wispbyte) |
