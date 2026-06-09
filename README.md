cara # J'Wash Cuci Motor - POS & Booking System

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D14.0-brightgreen)

Sistem POS (Point of Sale) dan manajemen booking online untuk bisnis cuci motor premium **J'Wash Cuci Motor**. Aplikasi ini menyediakan dashboard admin untuk kelola booking, laporan penjualan real-time, dan antarmuka kasir untuk mencatat transaksi harian.

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi](#instalasi)
- [Cara Menjalankan](#cara-menjalankan)
- [Penggunaan](#penggunaan)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Keamanan](#keamanan)
- [Backup & Restore](#backup--restore)
- [Troubleshooting](#troubleshooting)

## 🎯 Fitur Utama

### Dashboard Admin
- ✅ Kelola booking online dari pelanggan
- ✅ Lihat statistik harian: total booking, pending, omzet, jumlah cuci
- ✅ Riwayat transaksi kasir dengan detail
- ✅ Akses role-based dengan autentikasi JWT
- ✅ Hapus booking/transaksi yang tidak perlu

### Sistem Kasir (POS)
- ✅ Input paket cuci dengan 3 pilihan harga
- ✅ Tambahan layanan (addon) dengan harga dinamis
- ✅ Kalkulator pembayaran real-time dengan kembalian otomatis
- ✅ Cetak struk/nota transaksi
- ✅ Riwayat transaksi simpan otomatis ke database

### Website Publik
- ✅ Landing page showcase layanan J'Wash
- ✅ Daftar paket cuci dengan harga transparan
- ✅ Form booking online dengan validasi input
- ✅ Link WhatsApp otomatis untuk konfirmasi booking

### Keamanan & Maintenance
- ✅ Autentikasi login JWT dengan password hashing (bcrypt)
- ✅ Validasi input ketat untuk cegah SQL injection
- ✅ Backup database otomatis setiap 24 jam
- ✅ Script restore untuk recovery data

## 🏗️ Arsitektur Sistem

```
webcucimotor/
├── frontend/
│   ├── index.html          # Landing page publik
│   ├── admin.html          # Dashboard admin
│   ├── pos.html            # Interface kasir
│   ├── style.css           # Styling global
│   └── main.js             # Logic publik
├── backend/
│   ├── server.js           # Express API server
│   ├── db.js               # SQLite database setup
│   ├── backup.js           # Backup & restore script
│   ├── package.json        # Dependencies
│   ├── database.db         # SQLite database (auto-created)
│   └── backups/            # Folder backup database
├── launch-chrome.bat       # Script jalankan di Chrome
└── README.md               # Dokumentasi ini
```

### Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript vanilla, Lucide Icons
- **Backend:** Node.js, Express.js 4.18.2
- **Database:** SQLite 3
- **Auth:** JWT (jsonwebtoken 9.0.0), bcrypt 2.4.3
- **Server:** Node.js HTTP server dengan CORS

## 💻 Persyaratan Sistem

- **Node.js** >= 14.0
- **npm** >= 6.0
- **Google Chrome** (untuk GUI, atau browser lain yang support)
- **Windows/Mac/Linux**
- Minimal storage: 50 MB (database kosong)

## 📦 Instalasi

### 1. Clone/Download Project

```bash
git clone https://github.com/yourusername/webcucimotor.git
cd webcucimotor
```

### 2. Install Dependencies Backend

```bash
cd backend
npm install
```

Paket yang diinstall:
- `express`: Web server framework
- `cors`: Cross-origin resource sharing
- `jsonwebtoken`: JWT token generation
- `bcryptjs`: Password hashing
- `sqlite3`: Database driver

### 3. Verifikasi Instalasi

```bash
npm list
```

Output yang benar:
```
├── bcryptjs@2.4.3
├── cors@2.8.5
├── express@4.18.2
├── jsonwebtoken@9.0.0
└── sqlite3@5.1.6
```

## 🚀 Cara Menjalankan

### Opsi 1: Jalankan dengan Batch Script (Windows)

```bash
cd webcucimotor
.\launch-chrome.bat
```

Script ini akan:
1. Cari Chrome di PATH dan lokasi standar
2. Jalankan backend server
3. Buka admin.html dan pos.html di Chrome

### Opsi 2: Jalankan Manual

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm start
```

Output yang benar:
```
Server berjalan di http://localhost:3000
Admin user created: username=admin password=JWash@2024Secure
✓ Backup berhasil: backups/database-2024-06-04T10-30-45.db
```

**Terminal 2 - Buka di Browser:**

1. Buka Google Chrome
2. Navigasi ke:
   - **Landing Page:** http://localhost:3000
   - **Admin Dashboard:** http://localhost:3000/admin.html
   - **Kasir (POS):** http://localhost:3000/pos.html

## 📖 Penggunaan

### Login Admin Dashboard

1. Buka http://localhost:3000/admin.html
2. Login dengan:
   - **Username:** `admin`
   - **Password:** `JWash@2024Secure`
3. Halaman akan menampilkan:
   - Statistik booking & omzet
   - Daftar booking online yang menunggu
   - Riwayat transaksi kasir

### Gunakan Kasir (POS)

1. Buka http://localhost:3000/pos.html
2. Input data transaksi:
   - Pilih paket cuci (Standar 20rb, Premium 25rb, Lengkap 30rb)
   - Tambah addon jika ada (cek yang dipilih)
   - Nama pelanggan & tipe motor
   - Input uang tunai
3. Klik **Proses Transaksi** → kembalian otomatis hitung
4. Data tersimpan di database → muncul di admin dashboard

### Booking Online (Publik)

1. Buka http://localhost:3000
2. Klik **Pesan Sekarang** atau scroll ke form booking
3. Isi data:
   - Nama lengkap
   - Tipe motor
   - Nomor WhatsApp aktif
   - Pilih paket cuci
4. Klik **Konfirmasi via WhatsApp** → akan redirect ke chat WA

## 🔌 API Endpoints

### Authentication
- **POST** `/api/auth/login`
  - Request: `{ username, password }`
  - Response: `{ token, user }`
  - Status: 200 | 401

### Bookings (Protected - Butuh Token)
- **GET** `/api/bookings`
  - Response: `{ bookings: [...] }`
  - Header: `Authorization: Bearer <token>`
  
- **POST** `/api/bookings` (Public)
  - Request: `{ name, motor, wa, packageChoice, message }`
  - Response: `{ booking }`
  
- **DELETE** `/api/bookings/:id`
  - Header: `Authorization: Bearer <token>`

### Sales (Protected - Butuh Token)
- **GET** `/api/sales`
  - Response: `{ sales: [...] }`
  - Header: `Authorization: Bearer <token>`
  
- **POST** `/api/sales` (Public)
  - Request: `{ receiptNo, customer, motor, plate, packageName, addons, total, cash, change }`
  - Response: `{ sale }`
  
- **DELETE** `/api/sales/:id`
  - Header: `Authorization: Bearer <token>`
  
- **DELETE** `/api/sales`
  - Header: `Authorization: Bearer <token>`
  - Menghapus semua transaksi (hati-hati!)

### Summary (Protected)
- **GET** `/api/summary`
  - Response: `{ totalBookings, pendingBookings, todayRevenue, todaySalesCount }`

## 🗄️ Database

### Schema Tables

#### users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,       -- login username
    password TEXT,              -- bcrypt hashed password
    role TEXT                   -- 'admin' or 'cashier'
);
```

#### bookings
```sql
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,                  -- nama pelanggan
    motor TEXT,                 -- tipe motor
    wa TEXT,                    -- nomor whatsapp
    package TEXT,               -- paket yang dipilih
    message TEXT,               -- pesan tambahan
    date TEXT,                  -- tanggal booking
    status TEXT                 -- 'Pending' | 'Confirmed' | 'Done'
);
```

#### sales
```sql
CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    receipt_no TEXT,            -- nomor struk
    customer TEXT,              -- nama pelanggan
    motor TEXT,                 -- tipe motor
    plate TEXT,                 -- plat nomor
    package TEXT,               -- paket yang dibeli
    addons TEXT,                -- addon JSON array
    total INTEGER,              -- total harga (Rupiah)
    cash INTEGER,               -- uang yang diberikan
    change_amount INTEGER,      -- kembalian
    date TEXT,                  -- tanggal transaksi
    timestamp INTEGER           -- unix timestamp
);
```

## 🔒 Keamanan

### Implementasi Keamanan yang Sudah Ada

1. **Password Hashing**
   - Semua password di-hash dengan bcrypt sebelum disimpan
   - Tidak pernah simpan plaintext password

2. **JWT Authentication**
   - Token valid 8 jam
   - Endpoint admin/kasir butuh Authorization header
   - Token di-sign dengan secret key

3. **Input Validation**
   - Username: 3-50 karakter, alfanumerik saja
   - Password: minimal 6 karakter
   - Nomor WA: format `62xxxxxxxxx` atau lokal
   - Total transaksi: 0 - Rp 1.000.000
   - All input di-sanitasi (trim, substring 255 karakter)

4. **CORS Configuration**
   - Server allow cross-origin dari semua domain (default)
   - Untuk production, spesifikasi domain origin

### Rekomendasi Keamanan Tambahan

Untuk production deployment:

```javascript
// backend/server.js - tambah di awal:
app.use(cors({
    origin: 'https://yourdomain.com',  // specify domain
    credentials: true
}));

// Rate limiting untuk login
const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 menit
    max: 5                       // max 5 attempt
});
app.post('/api/auth/login', loginLimiter, ...);

// HTTPS only (gunakan reverse proxy seperti nginx)
```

## 💾 Backup & Restore

### Auto Backup

- **Jadwal:** Setiap 24 jam otomatis (saat server start + setiap hari)
- **Lokasi:** `backend/backups/database-YYYY-MM-DDThh-mm-ss.db`
- **Retensi:** File backup lebih dari 30 hari dihapus otomatis
- **Ukuran:** Sekitar 50-500 KB per backup (tergantung data)

### Manual Backup

```bash
cd backend
node backup.js backup
```

Output:
```
✓ Backup berhasil: backups/database-2024-06-04T10-30-45.db
```

### Lihat Daftar Backup

```bash
node backup.js list
```

Output:
```
Daftar backup:
  1. database-2024-06-04T10-30-45.db (125.50 KB) - 4/6/2024, 10:30:45 AM
  2. database-2024-06-03T10-30-45.db (120.25 KB) - 3/6/2024, 10:30:45 AM
```

### Restore dari Backup

```bash
node backup.js restore database-2024-06-04T10-30-45.db
```

Output:
```
✓ Safety backup dibuat: backups/database-safety-2024-06-04T10-32-15.db
✓ Database restored dari: database-2024-06-04T10-30-45.db
```

## 🐛 Troubleshooting

### Error: Chrome tidak ditemukan

**Masalah:** `launch-chrome.bat` tidak menemukan Chrome

**Solusi:**
1. Install Google Chrome dari https://www.google.com/chrome
2. Atau add `C:\Program Files\Google\Chrome\Application` ke PATH
3. Atau buka Chrome manual dan kunjungi `http://localhost:3000`

---

### Error: Port 3000 sudah dipakai

**Masalah:** `Error: listen EADDRINUSE :::3000`

**Solusi:**
```bash
# Windows - cari proses di port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>

# Atau gunakan port lain:
set PORT=3001
npm start
```

---

### Error: npm install gagal (sqlite3)

**Masalah:** `ERR! node-gyp rebuild` saat install sqlite3

**Solusi:**
```bash
# Install build tools
npm install --global windows-build-tools

# Atau gunakan pre-built:
npm install --verbose
```

---

### Error: Login gagal - "Username atau password salah"

**Masalah:** Tidak bisa login dengan credential default

**Solusi:**
1. Pastikan backend running (`npm start` di folder backend)
2. Pastikan buka di `http://localhost:3000/admin.html` (bukan `file://`)
3. Check di terminal backend apakah ada error
4. Reset database: hapus `backend/database.db` lalu jalankan ulang `npm start`

---

### Error: Booking tidak muncul di admin

**Masalah:** Booking berhasil disimpan tapi tidak muncul di dashboard

**Solusi:**
1. Reload halaman admin (F5)
2. Klik tombol **Refresh** di admin dashboard
3. Check di terminal backend apakah ada error API
4. Cek database: `node backup.js list` untuk lihat data ada

---

### Performance: Database lambat saat data banyak

**Masalah:** Query lambat setelah data mencapai 10.000+ records

**Solusi:**
```javascript
// Tambah index di db.js:
await run('CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date)');
await run('CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)');

// Pagination di API (opsional):
// GET /api/sales?page=1&limit=100
```

## 📊 Statistik & Metrics

### Yang Dicatat Sistem
- Total booking per hari/bulan
- Total omzet per hari/bulan
- Jumlah transaksi per hari
- Rata-rata transaksi
- Status booking (Pending/Confirmed/Done)
- Addon yang sering dibeli

### Export Data Ke CSV (Opsional)
```bash
# Gunakan script export-csv.js (bisa ditambahkan nanti)
node export-csv.js sales 2024-06-01 2024-06-30
# Output: sales-2024-06-01-to-2024-06-30.csv
```

## 📝 Lisensi

MIT License - Silakan gunakan untuk project komersial atau personal

## 👨‍💻 Tim Pengembang

- **Developer:** Oktavianus Dangga
- **Project:** J'Wash Cuci Motor - POS & Booking System
- **Version:** 1.0.0
- **Last Updated:** Juni 2024

## 📧 Support & Pertanyaan

Jika ada bug atau pertanyaan:
1. Cek folder `backend/backups` ada backup data
2. Check terminal backend untuk error message
3. Coba jalankan `npm start` di folder backend
4. Reset browser cache (Ctrl+Shift+Del → Clear browsing data)

---

**Selamat menggunakan J'Wash Cuci Motor POS System! 🚀**
