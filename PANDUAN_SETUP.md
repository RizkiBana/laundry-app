# 🧺 Rizki Laundry — Panduan Setup & Refactor

## Perubahan Utama

### Sistem Login
- **Admin**: username `admin` + password (via form)
- **Pelanggan**: langsung klik tombol tanpa password (shared account)
- Tidak ada registrasi, tidak ada multi-akun pelanggan

### Fitur Admin
| Menu | Fungsi |
|------|--------|
| Dashboard | Statistik harian: pesanan, pendapatan, status |
| Data Pesanan | Buat/Edit/Hapus pesanan + ubah status cucian |
| Data Pembayaran | Hanya ubah status lunas/belum lunas |
| Manajemen Harga | Tambah/edit/nonaktifkan harga layanan |
| Laporan | Laporan harian & bulanan |

### Fitur Pelanggan
| Menu | Fungsi |
|------|--------|
| Cek Status Laundry | Pesanan aktif + progress tracker realtime |
| Riwayat Laundry | Semua riwayat pesanan |

### Status Cucian (Baru)
`DITERIMA` → `DICUCI` → `DIKERINGKAN` → `DISETRIKA` → `SIAP_DIAMBIL` → `SELESAI`

---

## Cara Setup (Fresh Install)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit DATABASE_URL di .env

# 3. Push schema & seed database
npm run db:setup

# 4. Jalankan development server
npm run dev
```

## Cara Setup (Jika Database Sudah Ada)

```bash
# 1. Backup database dulu!
cp prisma/dev.db prisma/dev.db.backup

# 2. Push schema baru (hati-hati: akan reset enum)
npx prisma db push --force-reset

# 3. Seed ulang data awal
npm run db:seed

# 4. Jalankan
npm run dev
```

> ⚠️ **Penting**: Schema baru mengubah enum `OrderStatus` dan `PaymentStatus`.
> Jika ada data lama, jalankan dulu SQL di `prisma/migrations/manual/migrate_status.sql`
> sebelum push schema baru.

---

## Akun Login Default

| Peran | Login |
|-------|-------|
| Admin | username: `admin` / password: `password123` |
| Pelanggan | Klik tombol **"Masuk sebagai Pelanggan"** |

---

## Struktur File yang Diubah

```
src/
├── app/
│   ├── login/page.tsx              ← UI login 2 tab (admin/pelanggan)
│   ├── admin/
│   │   ├── page.tsx                ← Dashboard dengan statistik harian
│   │   ├── pesanan/
│   │   │   ├── page.tsx
│   │   │   └── PesananClient.tsx   ← Form buat/edit, ubah status, hapus
│   │   ├── pembayaran/
│   │   │   ├── page.tsx            ← Tabel dari data pesanan
│   │   │   └── PaymentActions.tsx  ← Toggle lunas/belum lunas
│   │   ├── harga/
│   │   │   ├── page.tsx
│   │   │   ├── PriceForm.tsx       ← Form tambah layanan
│   │   │   └── PriceActions.tsx    ← Edit & nonaktifkan harga
│   │   └── laporan/
│   │       ├── page.tsx
│   │       └── LaporanClient.tsx   ← Filter harian/bulanan
│   ├── pelanggan/
│   │   ├── page.tsx                ← Redirect ke /status
│   │   ├── status/
│   │   │   ├── page.tsx            ← Cek status aktif
│   │   │   ├── StatusTracker.tsx   ← Progress bar 6 langkah
│   │   │   └── RefreshButton.tsx   ← Tombol refresh status
│   │   └── riwayat/page.tsx        ← Riwayat semua pesanan
│   └── api/
│       ├── auth/login/route.ts     ← Login admin & pelanggan
│       ├── pesanan/route.ts        ← GET semua, POST buat pesanan
│       ├── pesanan/[id]/route.ts   ← PATCH status/data, DELETE
│       ├── pembayaran/route.ts     ← GET & PATCH status bayar
│       ├── harga/route.ts          ← CRUD harga layanan
│       └── laporan/route.ts        ← Query laporan harian/bulanan
├── components/
│   ├── AdminSidebar.tsx            ← 5 menu admin
│   ├── CustomerSidebar.tsx         ← 2 menu pelanggan
│   ├── StatusBadge.tsx             ← Badge status cucian & bayar
│   └── LogoutButton.tsx
├── lib/
│   ├── auth.ts                     ← JWT session (2 role: ADMIN, PELANGGAN)
│   └── utils.ts                    ← Label & warna status baru
prisma/
├── schema.prisma                   ← Schema final (enum baru)
└── seed.ts                         ← Seed 2 akun + 8 harga + 2 demo order
```

---

## Integrasi Data

```
Manajemen Harga  ──► digunakan saat buat pesanan (harga otomatis)
Data Pesanan     ──► otomatis tampil di Data Pembayaran
Status Pesanan   ──► langsung terlihat di halaman Pelanggan
Status Bayar     ──► tersinkron antara admin & pelanggan
```
