# User Guide - J'Wash Cuci Motor POS System

## 👥 Panduan untuk Admin & Staff

### Table of Contents
1. [Admin Dashboard - Kelola Booking](#admin-dashboard)
2. [Kasir (POS) - Input Transaksi](#kasir-pos)
3. [Landing Page - Booking Online](#landing-page)
4. [FAQ & Tips](#faq--tips)

---

## 🎯 Admin Dashboard

**Alamat:** `http://localhost:3000/admin.html`  
**Role:** Admin / Owner  
**Akses:** Login dengan username & password

### Step 1: Login

![login-step]
1. Buka halaman admin di browser
2. Masukkan **Username:** `admin`
3. Masukkan **Password:** `JWash@2024Secure`
4. Klik tombol **Masuk**
5. Jika berhasil, halaman akan menampilkan dashboard

**Catatan:** 
- Pastikan backend server sudah running (`npm start`)
- Jika error "Token invalid", refresh halaman atau logout-login ulang
- Token session valid 8 jam

### Step 2: Lihat Statistik Harian

Setelah login, dashboard akan menampilkan kartu statistik:

| Statistik | Keterangan |
|-----------|-----------|
| **Total Booking** | Jumlah booking online yang diterima |
| **Antrean Menunggu** | Jumlah booking dengan status Pending |
| **Omzet Kasir Hari Ini** | Total pendapatan dari transaksi kasir hari ini |
| **Total Cuci Kasir** | Berapa motor yang selesai hari ini |

**Contoh:**
```
Total Booking: 15
Antrean Menunggu: 3
Omzet Kasir Hari Ini: Rp 450.000
Total Cuci Kasir: 18 Motor
```

### Step 3: Kelola Booking Online

**Tabel "Antrean Booking Online"** menampilkan semua booking yang masuk dari website:

| Kolom | Tujuan |
|-------|--------|
| Waktu | Kapan booking masuk |
| Pelanggan | Nama yang booking |
| Motor | Tipe/merek motor |
| Paket | Paket cuci yang dipilih (Standar/Premium/Lengkap) |
| WhatsApp | Nomor WA pelanggan (bisa klik untuk chat) |
| Status | Pending / Confirmed / Done |
| Aksi | Tombol untuk hapus booking |

**Cara Mengelola:**
1. **Lihat detail:** Klik nomor WA untuk chat pelanggan di WhatsApp
2. **Konfirmasi booking:** Hubungi pelanggan lewat chat WA
3. **Hapus booking:** Klik ikon 🗑️ di kolom Aksi (jika batal)
4. **Refresh data:** Klik tombol **Refresh** untuk update data terbaru

### Step 4: Lihat Riwayat Transaksi Kasir

**Tabel "Transaksi Kasir (POS)"** menampilkan semua transaksi harian:

| Kolom | Tujuan |
|-------|--------|
| No Struk | Nomor receipt unik untuk setiap transaksi |
| Tanggal | Kapan transaksi terjadi |
| Pelanggan | Nama customer |
| Motor / Nopol | Tipe motor dan plat nomor |
| Paket | Paket cuci yang dipilih |
| Tambahan | Addon yang dibeli (jika ada) |
| Total | Harga total transaksi |
| Aksi | Tombol untuk hapus transaksi |

**Tips:**
- Data ini otomatis masuk dari kasir saat transaksi diproses
- Bisa delete transaksi yang salah input
- Untuk laporan lengkap, gunakan fitur **Export CSV** (di bawah)

### Step 5: Export Laporan ke CSV

**Untuk membuat laporan harian/mingguan:**

1. Buka browser console (F12)
2. Jalankan perintah:
```javascript
// Export transaksi kasir
fetch('/api/export/sales?startDate=2024-06-01&endDate=2024-06-30', {
    headers: {'Authorization': 'Bearer ' + localStorage.getItem('jwash_token')}
}).then(r => r.blob()).then(b => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(b);
    link.download = 'sales-report.csv';
    link.click();
});

// Export booking online
fetch('/api/export/bookings?startDate=2024-06-01&endDate=2024-06-30', {
    headers: {'Authorization': 'Bearer ' + localStorage.getItem('jwash_token')}
}).then(r => r.blob()).then(b => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(b);
    link.download = 'bookings-report.csv';
    link.click();
});
```

3. File CSV akan auto download ke folder Downloads
4. Buka di Excel untuk editing & presentasi

---

## 💰 Kasir (POS)

**Alamat:** `http://localhost:3000/pos.html`  
**Role:** Cashier / Staff  
**Akses:** Tidak perlu login (akses public)

### Step 1: Buka POS

1. Buka halaman kasir di browser
2. Halaman menampilkan form input transaksi

### Step 2: Input Data Transaksi

Isi form dari atas ke bawah:

#### A. Pilih Paket Cuci
```
Paket Standar (20rb)      → Cuci biasa + rantai
Paket Premium (25rb)      → Standar + wet waxing
Paket Lengkap (30rb)      → Premium + semi-coating
```

**Harga otomatis update di kolom kanan**

#### B. Tambahan Layanan (Optional)

Jika customer mau addon, cek kotak yang diinginkan:
- ☑️ **Semir Roda Premium** (+5rb) 
- ☑️ **Pembersihan Mesin Dalam** (+8rb)
- ☑️ **Coating Selektif** (+10rb)
- ☑️ **Detailing Interior** (+7rb)

**Harga addon langsung ditambah ke total**

#### C. Data Pelanggan

| Field | Contoh | Catatan |
|-------|--------|---------|
| Nama Pelanggan | Budi | Minimal 2 karakter |
| Tipe Motor | Honda Beat | Nama merek/tipe |
| Nomor Plat (Opsional) | B 1234 XYZ | Bisa kosong |

#### D. Kalkulator Pembayaran

**Sistem otomatis menghitung:**
- Subtotal: Harga paket
- Addon: Total addon yang dipilih
- **Total Akhir:** Subtotal + Addon

**Kasir input:**
1. Lihat **Total Akhir** di bagian bawah
2. Tanya ke customer: "Totalnya Rp XX, bayarnya berapa?"
3. Input di field **Uang Tunai**
4. **Kembalian** otomatis hitung

**Contoh:**
```
Paket Premium:        Rp 25.000
Addon Semir Roda:     Rp  5.000
---------------------------------
Total:                Rp 30.000

Uang Tunai:           Rp 50.000
Kembalian:            Rp 20.000 ✓
```

### Step 3: Proses Transaksi

1. Pastikan semua data terisi dengan benar
2. Klik tombol **Proses Transaksi**
3. Sistem akan:
   - Simpan data ke database
   - Generate nomor struk otomatis
   - Tampilkan receipt/nota di layar
   - Refresh form untuk transaksi baru

### Step 4: Cetak Struk

Setelah **Proses Transaksi** berhasil:
1. Nota akan muncul di layar
2. Klik **Print** (Ctrl+P)
3. Pilih printer atau "Save as PDF"
4. Berikan nota ke customer

**Isi Nota:**
```
═════════════════════════════
        J'WASH CUCI MOTOR
════════════════════════════
No Struk: STK-2024-06-04-001
Tanggal: 4 Juni 2024 10:30

Pelanggan: Budi
Motor: Honda Beat
Paket: Cuci Premium (25rb)
Addon: Semir Roda (5rb)
─────────────────────────────
Total:     Rp 30.000
Bayar:     Rp 50.000
Kembalian: Rp 20.000
═════════════════════════════
Terima kasih! Datang lagi.
═════════════════════════════
```

---

## 🌐 Landing Page

**Alamat:** `http://localhost:3000`  
**Akses:** Public (tidak perlu login)

### Fitur untuk Customer

#### 1. Lihat Layanan

- Scroll ke bagian **Layanan Eksklusif Kami**
- Tampil 3 paket cuci dengan deskripsi
- Foto/galeri hasil kerja

#### 2. Lihat Harga

- Scroll ke bagian **Pilih Paket Anda**
- Ada 3 paket dengan fitur detail
- Tombol **Pilih Paket** untuk booking

#### 3. Booking Online

Scroll ke form booking atau klik **Pesan Sekarang**

**Form Booking:**
| Field | Contoh |
|-------|--------|
| Nama Lengkap | Andi Wijaya |
| Tipe Motor | Honda Beat 2023 |
| WhatsApp (Aktif) | 081234567890 |
| Pilih Paket Cuci | Cuci Premium (25rb) |
| Pesan Tambahan | Mau warna berkilau maksimal |

**Tombol Aksi:**
- **Konfirmasi via WhatsApp** → Kirim ke chat WA
- Link akan membuka WhatsApp dengan pesan otomatis

**Pesan Otomatis:**
```
Halo J'Wash, saya mau booking cuci motor.
Nama: Andi Wijaya
Motor: Honda Beat 2023
Paket: Cuci Premium (25rb)
Nomor WA: 081234567890
Pesan: Mau warna berkilau maksimal
```

---

## ❓ FAQ & Tips

### Q: Gimana kalau server error?

**A:** Jalankan ulang backend:
```bash
cd backend
npm start
```

### Q: Data transaksi hilang?

**A:** Buka file dari backup:
```bash
cd backend
node backup.js list          # Lihat daftar backup
node backup.js restore <file> # Restore database
```

### Q: Mau ubah harga paket?

**A:** Edit di `pos.html` line ~250 atau `admin.html` line ~200
```html
<option value="Cuci Standar (20rb)">Cuci Standar (20rb)</option>
```
Ganti `20rb` ke harga baru

### Q: Mau tambah paket baru?

**A:** Hubungi developer untuk update database

### Q: Berapa lama token session berlaku?

**A:** 8 jam. Setelah itu harus login ulang

### Q: Bisa buka 2 tab admin sekaligus?

**A:** Ya bisa, tapi data mungkin belum sync real-time (refresh manual)

### Q: Mau export laporan di hari lain?

**A:** Gunakan export endpoint dengan tanggal:
```
/api/export/sales?startDate=2024-06-01&endDate=2024-06-30
```

### Q: Kasir bisa kelola booking juga?

**A:** Tidak. Kasir hanya akses halaman POS (public). Admin yang kelola booking

### Q: Bagaimana kalau customer salah pilih paket?

**A:** Admin bisa hapus booking lama di dashboard, customer booking ulang

---

## 📞 Kontak Support

Jika ada masalah:
1. Cek error di terminal backend
2. Refresh halaman browser
3. Clear cache browser (Ctrl+Shift+Del)
4. Hubungi developer

---

**Version:** 1.0.0  
**Last Updated:** Juni 2024  
**Support:** Octavianus Development Team
