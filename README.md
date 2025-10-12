# Platform E-Learning MA Alhuda

Selamat datang di repositori Platform E-Learning MA Alhuda. Aplikasi web ini dibangun untuk menyediakan platform pembelajaran berbasis video yang modern, interaktif, dan mudah diakses bagi siswa dan pengajar di MA Alhuda Pangabasen.

## ✨ Fitur Utama

- **Otentikasi Pengguna**: Login mudah dan aman menggunakan akun Google (Firebase Authentication).
- **Berbasis Peran (Role-Based)**: Tiga peran pengguna yang berbeda dengan hak akses masing-masing:
  - **Siswa**: Dapat menelusuri dan menonton video kursus yang tersedia.
  - **Instruktur**: Dapat mengelola (menambah, mengedit, menghapus) video dan playlist/kursus mereka sendiri.
  - **Admin**: Memiliki akses penuh untuk mengelola semua konten (video, playlist) dan pengguna.
- **Manajemen Video & Playlist**: Instruktur dan Admin dapat dengan mudah membuat kursus (playlist) dan mengunggah video (via URL YouTube atau MP4).
- **Deskripsi Otomatis dengan AI**: Fitur "Generate with AI" (menggunakan Genkit dan model Gemini) untuk membuat deskripsi video yang menarik secara otomatis berdasarkan judulnya.
- **Dasbor Intuitif**: Setiap peran memiliki dasbor yang disesuaikan untuk menampilkan informasi dan tindakan yang relevan.
- **Desain Responsif**: Tampilan yang optimal di berbagai perangkat, mulai dari desktop hingga ponsel.
- **Antarmuka Modern**: Dibangun dengan komponen UI yang bersih dan modern dari **shadcn/ui** dan **Tailwind CSS**.
- **Progressive Web App (PWA)**: Dapat di-install di perangkat untuk akses yang lebih cepat dan pengalaman seperti aplikasi native.

## 🚀 Teknologi yang Digunakan

- **Framework**: [Next.js](https://nextjs.org/) (dengan App Router)
- **Library UI**: [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Komponen UI**: [shadcn/ui](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Fitur AI**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
- **Ikon**: [Lucide React](https://lucide.dev/)

## ⚙️ Menjalankan Proyek Secara Lokal

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

### 1. Prasyarat

- [Bun](https://bun.sh/) (versi terbaru) - Package manager dan runtime yang cepat
- [Node.js](https://nodejs.org/) (versi 18 atau lebih baru) - Fallback jika diperlukan

### 2. Kloning Repositori

```bash
git clone https://github.com/USERNAME/NAMA-REPOSITORI.git
cd NAMA-REPOSITORI
```

### 3. Instalasi Dependensi

Jalankan perintah berikut untuk menginstal semua paket yang dibutuhkan:

```bash
bun install
```

### 4. Konfigurasi Firebase

Aplikasi ini memerlukan koneksi ke proyek Firebase untuk otentikasi dan database.

1.  Buat sebuah proyek di [Firebase Console](https://console.firebase.google.com/).
2.  Aktifkan **Authentication** (dengan Google sebagai provider) dan **Firestore Database**.
3.  Di pengaturan proyek Anda, buat sebuah "Web App" baru.
4.  Salin konfigurasi Firebase yang diberikan.
5.  Ubah nama file `.env.example` (jika ada) menjadi `.env.local` di root proyek, atau buat file baru bernama `.env.local`.
6.  Isi file `.env.local` dengan konfigurasi Firebase Anda. File ini akan diabaikan oleh Git untuk menjaga kerahasiaan kunci Anda.

    ```
    # Ganti dengan konfigurasi Firebase Anda
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
    ```
    
    **Penting**: Konfigurasi ini juga dapat diatur dalam file `src/firebase/config.ts`, namun penggunaan file `.env.local` lebih disarankan untuk pengembangan lokal.


### 5. Menjalankan Server Pengembangan

Setelah instalasi dan konfigurasi selesai, jalankan server pengembangan:

```bash
bun run dev
```

Buka [http://localhost:9002](http://localhost:9002) di browser Anda untuk melihat hasilnya.

---

Terima kasih telah menggunakan dan berkontribusi pada proyek ini!

## ☁️ Deploy ke Vercel

Untuk melakukan deploy ke Vercel:

1. Push repo ke GitHub/GitLab/Bitbucket.
2. Import project ke Vercel (Next.js terdeteksi otomatis).
3. Atur Environment Variables di Vercel Project Settings:
   - `GEMINI_API_KEY`: isi dengan API key Gemini Anda.
   - (opsional, jika tidak memakai `src/firebase/config.ts`) `NEXT_PUBLIC_FIREBASE_*` sesuai konfigurasi Firebase.
4. Build & Deploy: gunakan `bun install` dan `bun run build` untuk performa optimal.

### Checklist Pasca-Deploy
- PWA aktif di production: cek Service Worker dan Manifest via DevTools.
- Fitur AI (Generate Deskripsi): pastikan API key terbaca dan request sukses.
- Firebase Auth/Firestore: uji login Google dan akses data.
- Gambar dari host eksternal tampil: `images.unsplash.com`, `img.youtube.com`, dsb.