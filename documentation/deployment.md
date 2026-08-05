# Deployment ke Vercel

Panduan ini mengasumsikan repository project sudah ada di GitHub (lihat
`README.md` bagian "Buat Repository GitHub") dan Supabase project sudah
disiapkan sepenuhnya (schema, RLS, storage bucket — lihat `README.md`
bagian "Setup Supabase").

## 1. Buat Akun Vercel

1. Buka https://vercel.com → klik **Sign Up**.
2. Pilih **Continue with GitHub** supaya Vercel otomatis terhubung ke
   akun GitHub Anda (memudahkan langkah berikutnya).

## 2. Import Project

1. Di dashboard Vercel, klik **Add New...** → **Project**.
2. Cari repository GitHub project ini di daftar yang muncul, klik
   **Import**.
3. Vercel akan otomatis mendeteksi ini sebagai project Next.js —
   biarkan pengaturan **Framework Preset** tetap "Next.js", tidak perlu
   diubah.

## 3. Isi Environment Variable

Sebelum klik deploy, buka bagian **Environment Variables** di halaman
import, lalu isi persis seperti file `.env.local` Anda:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sama seperti di `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sama seperti di `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | Sama seperti di `.env.local` |

> `DISCORD_BOT_TOKEN` dan `DISCORD_APPROVAL_CHANNEL_ID` **TIDAK** perlu
> diisi di Vercel — dua variabel itu hanya dipakai oleh Discord Bot yang
> di-hosting terpisah di Pterodactyl/Wispbyte (lihat `discord-bot/README.md`),
> bukan bagian dari aplikasi Next.js ini.

## 4. Deploy

1. Klik tombol **Deploy**.
2. Tunggu proses build selesai (±2-3 menit). Jika berhasil, Vercel
   menampilkan URL seperti `https://nama-project.vercel.app` — website
   Anda sudah online dan bisa diakses siapa saja.

## 5. (Opsional) Pakai Domain Sendiri

Jika sekolah punya domain sendiri (misalnya `asset.sman1cikembar.sch.id`):

1. Di dashboard project Vercel, buka tab **Settings** → **Domains**.
2. Masukkan domain Anda, ikuti instruksi Vercel untuk mengatur DNS
   (biasanya menambahkan record CNAME/A di pengaturan domain Anda).

## 6. Update Setelah Deploy Pertama

Setiap kali ada perubahan kode yang di-push ke branch `main` di GitHub,
Vercel otomatis membangun ulang dan mendeploy versi terbaru — tidak perlu
langkah manual tambahan.

## Troubleshooting

**Build gagal di Vercel tapi berhasil di komputer lokal:**
- Cek apakah semua Environment Variable di atas sudah diisi dengan benar
  di dashboard Vercel (bukan hanya di `.env.local` komputer Anda).

**Halaman muncul tapi data tidak muncul / error saat login:**
- Kemungkinan `NEXT_PUBLIC_SUPABASE_URL` atau `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  salah ketik. Bandingkan lagi dengan Dashboard Supabase → Settings → API.
