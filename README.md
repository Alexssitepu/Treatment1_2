# Portal Layanan Mahasiswa

Sistem web sederhana untuk menginput data pengajuan layanan mahasiswa melalui form, lalu menampilkannya pada tabel. Dibuat untuk memenuhi tugas praktikum web (HTML, CSS, JavaScript).

## Fitur

- **Halaman Form (`index.html`)** — input Nama, NIM, Jenis Layanan, Keterangan, dengan validasi sederhana dan nomor tiket otomatis.
- **Halaman Data (`data.html`)** — menampilkan seluruh data yang sudah diinput dalam bentuk tabel, lengkap dengan status "belum ada data".
- Data diproses dan disimpan menggunakan JavaScript (`localStorage`), sehingga tetap ada meski halaman di-refresh atau dibuka ulang di browser yang sama.
- Layout responsif (desktop, tablet, mobile).

## Struktur File

```
portal-layanan/
├── index.html          # Halaman form input
├── data.html            # Halaman tabel data
├── css/
│   └── style.css        # Seluruh styling
├── js/
│   └── app.js            # Logika simpan & render data
└── README.md
```

## Cara Menjalankan

Tidak perlu server khusus — cukup buka `index.html` langsung di browser, atau gunakan Live Server (VS Code) untuk pengalaman terbaik.

## Cara Push ke GitHub (repo sudah dibuat, masih kosong)

Jalankan perintah berikut dari dalam folder `portal-layanan/`:

```bash
git init
git add .
git commit -m "Initial commit: struktur project portal layanan mahasiswa"

git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git branch -M main
git push -u origin main
```

Ganti `USERNAME/NAMA-REPO` dengan alamat repository GitHub Anda.

Setelah itu, disarankan membuat beberapa commit tambahan secara bertahap (misalnya: `"Menambahkan halaman form"`, `"Menambahkan halaman tabel"`, `"Menambahkan styling responsif"`) agar riwayat commit terlihat progresif, bukan satu commit besar.

## Teknologi

- HTML5
- CSS3 (custom, tanpa framework, mendukung layout responsif)
- JavaScript (Vanilla JS, `localStorage`)
