# Deploy Aplikasi J'Wash Permanen

Panduan ini membantu kamu membuat aplikasi `webcucimotor` dapat diakses orang lain secara permanen melalui hosting.

## 1. Siapkan kode di GitHub

1. Buat akun GitHub di https://github.com jika belum punya.
2. Buat repository baru, misalnya `webcucimotor`.
3. Di terminal, jalankan:
   ```powershell
   cd "c:\Users\Oktavianus Dangga\Documents\webcucimotor"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/webcucimotor.git
   git push -u origin main
   ```
   Ganti `USERNAME` dengan username GitHub kamu.

## 2. Buat akun Render

1. Buka https://render.com
2. Daftar / login menggunakan akun GitHub.
3. Berikan izin Render untuk mengakses repository kamu.

## 3. Deploy ke Render

1. Klik `New` → `Web Service`.
2. Pilih repository `webcucimotor`.
3. Atur konfigurasi:
   - `Name`: misalnya `jwash`
   - `Region`: pilih lokasi terdekat
   - `Branch`: `main`
   - `Root Directory`: `backend`
   - `Build Command`: `npm install`
   - `Start Command`: `npm start`
4. Klik `Create Web Service` dan tunggu proses deploy selesai.

## 4. Cek URL publik

Setelah deploy selesai, Render akan memberi URL publik seperti:
- `https://namaproject.onrender.com`

Buka:
- `https://namaproject.onrender.com/admin.html`
- `https://namaproject.onrender.com/pos.html`

## 5. Catatan penting

- `localtunnel` / `ngrok` hanya untuk sementara.
- Untuk publik permanen, pakai hosting seperti Render.
- Jangan gunakan `localhost` jika ingin orang lain akses dari internet.
- Jika ingin lebih profesional, beli domain dan arahkan ke URL Render.

## 6. Alternatif lain

Jika tidak ingin pakai Render, kamu bisa gunakan:
- `Railway.app`
- `Fly.io`
- `DigitalOcean App Platform`
- VPS seperti `DigitalOcean`, `Linode`, atau `AWS EC2`

Semua layanan tersebut membutuhkan kode yang sudah ada di repository dan perintah start `npm start` di folder `backend`.
