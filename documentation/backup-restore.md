# Backup &amp; Restore Database

## Cara Backup (Export)

### Opsi A — Lewat Dashboard Supabase (paling mudah)

1. Buka Dashboard Supabase project Anda → menu **Database** di sidebar.
2. Buka tab **Backups**.
3. Supabase otomatis membuat backup harian (untuk project di plan
   berbayar) — untuk plan gratis, gunakan Opsi B di bawah untuk backup
   manual secara berkala (disarankan minimal 1x per minggu).

### Opsi B — Manual via SQL Editor (berlaku di semua plan, termasuk gratis)

1. Buka **SQL Editor** di Dashboard Supabase.
2. Jalankan query berikut untuk masing-masing tabel penting, lalu klik
   **Export** → **Download as CSV** pada hasilnya:
   ```sql
   select * from profiles;
   select * from loans;
   select * from loan_items;
   select * from atk_requests;
   select * from atk_request_items;
   select * from assets;
   select * from atk_items;
   select * from students;
   select * from classes;
   select * from academic_years;
   ```
3. Simpan seluruh file CSV tersebut di tempat yang aman (Google Drive
   sekolah, external hard drive, dll).

### Opsi C — pg_dump (untuk yang familiar dengan command line)

Supabase menyediakan connection string database di **Settings** →
**Database** → **Connection string**. Dengan `pg_dump` ter-install:

```
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" > backup.sql
```

Ganti `[PASSWORD]` dan `[HOST]` sesuai connection string Anda. File
`backup.sql` yang dihasilkan berisi seluruh struktur dan data database.

## Cara Restore

### Dari CSV (Opsi B di atas)

1. Buka **Table Editor** di Dashboard Supabase, pilih tabel yang ingin
   di-restore.
2. Klik **Insert** → **Import data from CSV**, pilih file CSV yang
   pernah di-export.

> Perhatian: restore CSV bisa menimbulkan konflik primary key/foreign
> key jika data lain sudah berubah sejak backup dibuat. Gunakan cara ini
> hanya untuk pemulihan darurat dan periksa hasilnya di Table Editor
> setelah proses selesai.

### Dari pg_dump (Opsi C di atas)

```
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" < backup.sql
```

## Rekomendasi

Untuk keamanan data sekolah, lakukan backup manual (Opsi B atau C)
setidaknya **setiap akhir minggu**, dan simpan salinannya di lebih dari
satu tempat (misalnya Google Drive sekolah + penyimpanan lokal).
