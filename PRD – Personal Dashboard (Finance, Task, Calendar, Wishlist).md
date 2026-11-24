# PRD – Personal Dashboard (Finance, Task, Calendar, Wishlist)

**Versi:** 1.0 · **Status:** Siap diberikan ke Codex · **Stack:** React + Supabase

## 1. Ringkasan

Aplikasi web pribadi (single-user) berbentuk dashboard untuk mengelola keuangan, task, kalender, dan wishlist. Mobile-first dan bisa di-install sebagai PWA. Fitur prioritas pertama adalah **Finance** dengan konsep inti: *"Hari ini aku boleh pakai uang berapa?"*.

## 2. Tujuan & Non-Tujuan

**Tujuan**

- Tahu sisa uang dan batas pengeluaran harian secara real-time.
- Mencatat pengeluaran dalam 2–3 ketukan dari dashboard (shortcut).
- Mengelola task dengan kategori dan deadline, tampil di kalender.
- Menyimpan wishlist/impian dan mengaitkannya ke target tabungan.

**Non-Tujuan (v1)**

- Multi-user / berbagi akun.
- Integrasi bank / auto-import mutasi.
- Multi-currency (hanya IDR).
- Aplikasi native.

## 3. Pengguna

Satu pengguna (pemilik). Login via Supabase Auth (Google OAuth, opsional email magic link). Semua data privat dengan Row Level Security.

## 4. Prioritas & Fase

| Fase | Isi | Prioritas |
| --- | --- | --- |
| 0 | Setup project, auth, layout dashboard, PWA | Wajib |
| 1 | **Finance** (inti) | P0 |
| 2 | **Task & kategori** + deadline | P0 |
| 3 | **Kalender** internal + sinkron Google Calendar | P1 |
| 4 | **Wishlist** | P2 (opsional) |
| 5 | Polish: notifikasi, laporan, dark mode, export | P2 |

## 5. Tech Stack

- **Frontend:** React + Vite + TypeScript, React Router, TanStack Query, Tailwind CSS + shadcn/ui, React Hook Form + Zod, date-fns, Recharts, FullCalendar (atau react-big-calendar).
- **Backend:** Supabase (Postgres, Auth, RLS, Storage, Edge Functions, `pg_cron` bila perlu).
- **PWA:** `vite-plugin-pwa` (installable, offline shell).
- **Deploy:** Vercel/Netlify (frontend), Supabase Cloud.
- **Konvensi:** nominal uang disimpan sebagai `bigint` dalam rupiah (tanpa desimal). Timezone default `Asia/Jakarta`.

## 6. Fitur 1 – Finance (P0)

### 6.1 Konsep

Pengguna mengatur **periode** (default: bulanan, tanggal mulai bisa diatur, mis. tanggal gajian). Sistem menghitung **jatah harian** dari sisa uang yang boleh dipakai setelah target tabungan dan kewajiban tetap dikurangi.

### 6.2 Fitur

1. **Pemasukan**: catat nominal, sumber, tanggal, catatan. Mendukung pemasukan berulang (mis. gaji bulanan).
2. **Pengeluaran**: catat nominal, kategori, tanggal, catatan, dompet.
3. **Dompet/akun**: Cash, Bank, E-wallet (nama + saldo awal). Transfer antar dompet.
4. **Kategori** pengeluaran (Makan, Transport, Tagihan, Hiburan, dll.) bisa ditambah/diedit, dengan warna & ikon.
5. **Pengeluaran tetap/tagihan** (kos, internet, langganan): tanggal jatuh tempo, nominal, status bayar. Dikurangkan dari budget periode sebelum jatah harian dihitung.
6. **Target tabungan** periode: user input nominal (atau persen) yang ingin ditabung.
7. **Jatah harian** (fitur utama dashboard).
8. **Quick-add**: tombol FAB di semua halaman membuka bottom sheet: nominal (numpad besar), kategori (chip terakhir dipakai), simpan. Target ≤ 3 ketukan.
9. **Tracker harian**: progress bar jatah hari ini, riwayat transaksi hari ini, grafik tren 7/30 hari, pengeluaran per kategori.
10. **Edit/hapus transaksi** (soft delete).

### 6.3 Rumus Jatah Harian

Definisi (per periode aktif):

- `total_pemasukan` = jumlah pemasukan yang sudah/akan diterima periode ini
- `target_tabungan` = target yang diisi user
- `tagihan_tetap_belum_bayar` = total tagihan tetap periode ini yang belum dibayar
- `pengeluaran_variabel_terpakai` = total pengeluaran non-tagihan sejak awal periode sampai **kemarin**
- `sisa_hari` = jumlah hari dari **hari ini** sampai akhir periode (inklusif)

```
budget_variabel = total_pemasukan - target_tabungan - tagihan_tetap_total
sisa_budget     = budget_variabel - pengeluaran_variabel_terpakai(sampai kemarin)
jatah_harian    = floor(sisa_budget / sisa_hari)
sisa_hari_ini   = jatah_harian - pengeluaran_variabel_hari_ini
```

Aturan:

- Dihitung ulang dinamis setiap hari: kalau kemarin hemat, jatah hari ini naik (carry-over otomatis); kalau boros, jatah turun.
- Jika `sisa_hari_ini < 0`, tampilkan status **"Melebihi jatah"** (merah) dan tunjukkan dampaknya ke jatah besok.
- Jika `sisa_budget <= 0`, tampilkan peringatan bahwa target tabungan tidak tercapai dan sarankan menurunkan target.
- Pembayaran tagihan tetap **tidak** mengurangi jatah harian (sudah dialokasikan), tapi tetap tercatat sebagai pengeluaran.
- **Sisa uang total** = jumlah saldo seluruh dompet. Ditampilkan terpisah dari jatah harian.
- Fungsi hitung dibuat sebagai pure function TypeScript (mudah di-unit-test) **dan** view/RPC di Postgres untuk konsistensi.

### 6.4 Acceptance Criteria

- Menambah pengeluaran via quick-add langsung memperbarui `sisa_hari_ini` tanpa reload (optimistic update).
- Mengubah target tabungan langsung menghitung ulang jatah harian.
- Contoh uji: pemasukan 3.000.000, tabungan 500.000, tagihan 1.000.000, 30 hari tersisa, belum ada pengeluaran → jatah harian = 50.000.
- Format tampilan `Rp 50.000`; input numpad hanya angka dengan pemisah ribuan otomatis.

## 7. Fitur 2 – Task Management (P0)

### 7.1 Fitur

1. **Task** dengan: judul, deskripsi/catatan (rich text sederhana atau markdown), kategori, prioritas (Rendah/Sedang/Tinggi), status (To do / Doing / Done), deadline (tanggal + jam opsional), checklist subtask.
2. **Kategori** default: Kerjaan, Kuliah, Pribadi. User bisa tambah/ubah/hapus, dengan warna.
3. **Tampilan:** List (default, dikelompokkan: Hari ini, Besok, Minggu ini, Nanti, Tanpa deadline), Board/Kanban per status, filter per kategori, pencarian.
4. **Quick-add task**: ketik judul, pilih kategori & deadline (chip "Hari ini / Besok / Pilih tanggal").
5. **Pengingat**: badge task overdue dan jatuh tempo hari ini di dashboard.
6. **Task berulang** (harian/mingguan/bulanan) – P1.
7. **Catatan bebas** (note) tanpa deadline: bisa dibuat sebagai task tanpa status, atau tipe `note`.

### 7.2 Acceptance Criteria

- Task dengan deadline otomatis muncul di kalender.
- Mencentang task Done menyoret judul dan memindahkannya ke bagian selesai; bisa di-undo.
- Filter kategori tersimpan di URL query agar bisa di-bookmark.

## 8. Fitur 3 – Kalender (P1)

### 8.1 Kalender internal (wajib)

- Tampilan bulan, minggu, agenda (default agenda di mobile).
- Menampilkan: task ber-deadline (warna sesuai kategori), tagihan jatuh tempo, event manual.
- Klik item membuka detail; bisa buat event manual.

### 8.2 Sinkron Google Calendar

Pendekatan bertahap agar aman dan realistis:

- **Tahap A (MVP):** tombol **"Tambah ke Google Calendar"** pada task (link template `calendar.google.com/calendar/render?action=TEMPLATE...`) dan **export file .ics** (satu event atau feed). Tidak butuh OAuth tambahan.
- **Tahap B (sinkron otomatis, searah App → Google):**
  - Tambah scope `https://www.googleapis.com/auth/calendar.events` pada Google OAuth.
  - Karena Supabase tidak menyimpan refresh token Google secara permanen, simpan `refresh_token` terenkripsi di tabel `google_connections` (hanya diakses Edge Function dengan service role, **bukan** dari client).
  - Edge Function `sync-google-calendar`: saat task dibuat/diubah/dihapus (via database webhook atau dipanggil client), buat/update/hapus event di Google Calendar; simpan `google_event_id` di task.
  - Pengaturan: pilih calendar tujuan, toggle sinkron per kategori.
- **Tahap C (opsional):** sinkron dua arah (Google → App) dengan `syncToken` + polling terjadwal.

### 8.3 Acceptance Criteria

- Task dengan deadline muncul di kalender web maksimal 1 detik setelah disimpan.
- Pada Tahap B, mengubah deadline task memperbarui event Google; menghapus task menghapus event.
- Jika token Google kadaluarsa/dicabut, UI menampilkan status "Perlu hubungkan ulang" tanpa merusak data lokal.

## 9. Fitur 4 – Wishlist / Kertas Impian (P2, opsional)

- Item: nama, gambar (upload ke Supabase Storage atau URL), harga target, link produk, prioritas, catatan, status (Impian / Menabung / Tercapai).
- Tampilan **vision board** (grid kartu bergambar) dan list.
- **Progress menabung** per item: tambahkan setoran manual, bar progress, estimasi tanggal tercapai berdasarkan rata-rata setoran.
- Tombol **"Jadikan target tabungan"**: menghubungkan item ke target tabungan periode di Finance (opsional).
- Item tercapai dipindah ke arsip "Impian terwujud".

## 10. Dashboard (Halaman Utama)

Urutan kartu (mobile, atas ke bawah):

1. **Sisa jatah hari ini** (angka besar, progress bar, status warna hijau/kuning/merah).
2. **Ringkasan**: sisa uang total, sisa budget periode, target tabungan & progres, sisa hari.
3. **Task hari ini & overdue** (maks 5, tombol centang cepat).
4. **Agenda 3 hari ke depan** (task + tagihan).
5. **Grafik pengeluaran 7 hari** + top kategori.
6. **Wishlist teratas** (jika fitur aktif).

Desktop: grid 2–3 kolom dengan sidebar navigasi. Mobile: bottom navigation (Home, Finance, Task, Kalender, Wishlist) + FAB quick-add kontekstual (di Finance menambah transaksi, di Task menambah task, di Home menampilkan menu pilihan).

## 11. Navigasi & Rute

```
/                 Dashboard
/finance          Ringkasan finance + tracker harian
/finance/transactions
/finance/bills
/finance/wallets
/finance/settings (periode, target tabungan, kategori)
/tasks            List/Board
/tasks/:id
/calendar
/wishlist
/settings         Profil, koneksi Google, tema, data
/login
```

## 12. Model Data (Supabase / Postgres)

Semua tabel punya `id uuid pk default gen_random_uuid()`, `user_id uuid not null references auth.users`, `created_at`, `updated_at`. Aktifkan **RLS** di semua tabel dengan policy `user_id = auth.uid()` untuk select/insert/update/delete.

**profiles** – `display_name`, `timezone` (default Asia/Jakarta), `period_start_day int` (1–28), `theme`.

**wallets** – `name`, `type` (cash/bank/ewallet), `initial_balance bigint`, `is_archived`.

**categories** – `kind` (expense/income/task), `name`, `color`, `icon`, `sort_order`, `is_archived`.

**transactions** – `type` (income/expense/transfer), `amount bigint check (amount > 0)`, `wallet_id`, `to_wallet_id` (untuk transfer), `category_id`, `bill_id` (nullable), `occurred_on date`, `note`, `deleted_at`.

**bills** – `name`, `amount bigint`, `due_day int` atau `due_date`, `recurrence` (none/monthly), `category_id`, `is_active`. **bill\_payments** – `bill_id`, `period_start date`, `transaction_id`, `paid_at`.

**recurring\_incomes** – `name`, `amount`, `day_of_month`, `wallet_id`, `is_active`.

**budget\_periods** – `start_date`, `end_date`, `savings_target bigint`, `note`. Dibuat otomatis berdasarkan `period_start_day`.

**tasks** – `title`, `notes`, `type` (task/note), `category_id`, `priority` (low/med/high), `status` (todo/doing/done), `due_at timestamptz` (nullable), `all_day bool`, `completed_at`, `recurrence_rule` (RRULE text), `google_event_id`, `sort_order`, `deleted_at`.

**subtasks** – `task_id`, `title`, `is_done`, `sort_order`.

**events** – `title`, `description`, `starts_at`, `ends_at`, `all_day`, `google_event_id`.

**google\_connections** – `google_email`, `refresh_token_encrypted`, `calendar_id`, `status`, `last_synced_at`. Hanya dapat diakses service role (tanpa policy select untuk client).

**wishlist\_items** – `name`, `image_path`, `target_price bigint`, `url`, `priority`, `status`, `note`, `achieved_at`. **wishlist\_contributions** – `item_id`, `amount bigint`, `contributed_on`.

**View/RPC yang diperlukan**

- `get_daily_allowance(p_date date)` → mengembalikan `budget_variabel`, `sisa_budget`, `sisa_hari`, `jatah_harian`, `terpakai_hari_ini`, `sisa_hari_ini`.
- `get_wallet_balances()` → saldo tiap dompet (saldo awal + pemasukan − pengeluaran ± transfer).
- `get_spending_by_category(p_start, p_end)`.

**Index:** `(user_id, occurred_on)` pada transactions, `(user_id, due_at)` pada tasks.

## 13. Keamanan & Privasi

- RLS aktif di semua tabel; uji bahwa user lain tidak dapat membaca data.
- Hanya `anon key` di frontend; `service_role` hanya di Edge Function.
- Refresh token Google terenkripsi (Supabase Vault atau `pgcrypto`).
- Storage bucket wishlist privat dengan signed URL.
- Validasi input dengan Zod di client dan constraint di database.

## 14. Persyaratan Non-Fungsional

- **Mobile-first:** didesain untuk lebar 360px; target sentuh ≥ 44px; bottom sheet untuk form.
- **PWA:** installable, ikon, splash, cache shell; transaksi baru saat offline masuk antrean lokal lalu disinkron (P2).
- **Performa:** LCP < 2,5 s pada 4G; lazy-load per route.
- **Aksesibilitas:** kontras warna AA, label form, navigasi keyboard di desktop.
- **UX:** bahasa Indonesia; format `Rp 1.234.567`; tanggal `dd MMM yyyy`; dark mode.
- **Reliabilitas:** soft delete + undo; ekspor data CSV (transaksi & task).
- **Testing:** unit test untuk fungsi jatah harian & saldo (Vitest), minimal satu e2e flow (Playwright): login → tambah pemasukan → tambah pengeluaran → jatah berubah.

## 15. Struktur Proyek yang Disarankan

```
/src
  /app            router, providers, layout
  /features
    /finance      components, hooks, api, utils (allowance.ts)
    /tasks
    /calendar
    /wishlist
    /settings
  /components/ui  shadcn
  /lib            supabase client, format, date
  /types          generated Supabase types
/supabase
  /migrations     SQL schema + RLS + RPC
  /functions      sync-google-calendar
```

## 16. Milestone

1. **M0 – Fondasi:** Vite + TS + Tailwind + shadcn, Supabase project, auth Google, layout responsif, PWA, migrasi awal + RLS.
2. **M1 – Finance inti:** dompet, kategori, transaksi, quick-add, pemasukan, target tabungan, jatah harian + dashboard card, tracker harian.
3. **M2 – Finance lanjutan:** tagihan tetap, pemasukan berulang, grafik, edit/hapus + undo, ekspor CSV.
4. **M3 – Task:** kategori task, list & board, subtask, deadline, quick-add, kartu dashboard.
5. **M4 – Kalender:** kalender internal, event manual, tagihan di kalender, Google Calendar tahap A (link + .ics).
6. **M5 – Google sync (tahap B):** OAuth scope, Edge Function, pengaturan sinkron.
7. **M6 – Wishlist** (opsional) + polish, dark mode, test e2e.

## 17. Definition of Done (per fitur)

- Semua acceptance criteria terpenuhi dan teruji di viewport 360px dan desktop.
- Migrasi SQL tersimpan di `/supabase/migrations`, RLS diuji.
- Tidak ada error TypeScript/ESLint; fungsi hitung punya unit test.
- State loading, kosong, dan error ditangani di setiap halaman.

## 18. Asumsi & Pertanyaan Terbuka

1. Periode default: bulanan mulai tanggal gajian (user mengatur `period_start_day`).
2. Carry-over: sisa jatah hari sebelumnya otomatis disebar ke sisa hari (bukan dikunci per hari).
3. Tagihan tetap dialokasikan penuh di awal periode, tidak memengaruhi jatah harian saat dibayar.
4. Sinkron Google awalnya searah (App → Google).
5. Perlu diputuskan nanti: apakah tabungan dicatat sebagai transaksi transfer ke dompet "Tabungan" atau hanya angka target.

## 19. Prompt Pembuka untuk Codex

> Bangun aplikasi sesuai PRD ini menggunakan React + Vite + TypeScript, Tailwind, shadcn/ui, TanStack Query, dan Supabase. Kerjakan **per milestone**, mulai M0 lalu M1. Untuk setiap milestone: (1) buat migrasi SQL beserta RLS, (2) implementasikan fitur mobile-first, (3) tulis unit test untuk logika jatah harian, (4) jelaskan cara menjalankan dan menguji. Jangan lanjut ke milestone berikutnya sebelum saya konfirmasi. Tanyakan hal yang ambigu sebelum mengasumsikan.
