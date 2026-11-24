# Panduan Setup Supabase — Ruang Pribadi

> Ikuti langkah-langkah berikut **secara urut** sebelum menjalankan aplikasi untuk pertama kali.

---

## 1. Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com) dan login.
2. Klik **New project**.
3. Pilih organisasi, beri nama project (mis. `ruang-pribadi`), pilih region terdekat (mis. **Southeast Asia – Singapore**), dan buat password database yang kuat.
4. Tunggu hingga project selesai di-provisioning (~1–2 menit).

---

## 2. Aktifkan Google OAuth

### a. Dapatkan Client ID & Client Secret dari Google Cloud Console

1. Buka [https://console.cloud.google.com](https://console.cloud.google.com).
2. Buat project baru atau pilih project yang sudah ada.
3. Di menu kiri pilih **APIs & Services → Credentials**.
4. Klik **Create Credentials → OAuth client ID**.
5. Pilih **Application type: Web application**.
6. Di bagian **Authorized redirect URIs**, tambahkan:
   - `https://<project-ref>.supabase.co/auth/v1/callback`
   - (ganti `<project-ref>` dengan ID project Supabase kamu, ada di Settings → General)
7. Klik **Create**. Salin **Client ID** dan **Client Secret** yang muncul.

### b. Aktifkan di Supabase

1. Di dashboard Supabase, buka **Authentication → Providers**.
2. Klik **Google**, lalu aktifkan toggle-nya.
3. Tempel **Client ID** dan **Client Secret** dari langkah di atas.
4. Klik **Save**.

---

## 3. Set Redirect URL

Masih di **Authentication → URL Configuration**:

| Field | Nilai |
|---|---|
| Site URL | `http://localhost:5173` (development) |
| Additional redirect URLs | URL produksi kamu (mis. `https://ruang-pribadi.vercel.app`) |

Klik **Save**.

---

## 4. Konfigurasi Environment Variables

Di root project, salin file contoh:

```bash
cp .env.example .env
```

Buka `.env` dan isi nilai berikut (ambil dari **Settings → API** di dashboard Supabase):

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

> [!CAUTION]
> Jangan pernah commit file `.env` ke repository. Pastikan sudah ada di `.gitignore`.

---

## 5. Jalankan Migrasi SQL

Buka **SQL Editor** di dashboard Supabase, lalu jalankan file migrasi **secara urut**:

### Migrasi 1 — Foundation (schema + RLS + indexes + triggers)

Salin seluruh isi `supabase/migrations/0001_foundation.sql` ke SQL Editor, lalu klik **Run**.

### Migrasi 2 — RPC Functions

Salin seluruh isi `supabase/migrations/0002_rpc.sql` ke SQL Editor, lalu klik **Run**.

### Migrasi 3 — Seed Defaults

Salin seluruh isi `supabase/migrations/0003_seed_defaults.sql` ke SQL Editor, lalu klik **Run**.

> [!IMPORTANT]
> Urutan harus **0001 → 0002 → 0003**. Migrasi berikutnya bergantung pada tabel yang dibuat sebelumnya.

---

## 6. Test Row Level Security (RLS)

Di **SQL Editor**, jalankan query berikut sebagai role `anon`:

```sql
-- Ganti role sementara ke anon
set role anon;
select * from profiles;
```

Hasilnya **harus kosong** (0 rows). Ini membuktikan bahwa RLS aktif dan user yang belum login tidak bisa membaca data apa pun.

Reset role setelah selesai:

```sql
reset role;
```

---

## 7. Buat Storage Bucket untuk Wishlist

1. Di dashboard Supabase, buka **Storage**.
2. Klik **New bucket**.
3. Beri nama: `wishlist-images`.
4. Pastikan **Public bucket** di-nonaktifkan (bucket harus **private**).
5. Klik **Save**.

> [!TIP]
> Untuk mengizinkan user upload gambar wishlist mereka sendiri, tambahkan Storage Policy berikut di bucket `wishlist-images`:
> - **INSERT**: `(auth.uid() is not null)`
> - **SELECT**: `(auth.uid() is not null)` atau gunakan signed URL dari server

---

## 8. Jalankan Aplikasi

```bash
npm install
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser. Login dengan Google dan data default (wallet Kas + 10 kategori) akan otomatis tersedia.
