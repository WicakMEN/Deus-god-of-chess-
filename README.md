# ♟️ Deus Chess: Epistemic AI & God Mode

[![Play & Install Online](https://img.shields.io/badge/PLAY%20ONLINE-deus--chess--epistemic--ai--god--mode.ai.studio-F59E0B?style=for-the-badge&logo=googlechrome&logoColor=black)](https://deus-chess-epistemic-ai-god-mode.ai.studio)
[![Progressive Web App](https://img.shields.io/badge/PWA-Ready%20%26%20Installable-gold?style=for-the-badge&logo=pwa)](https://deus-chess-epistemic-ai-god-mode.ai.studio)
[![React 19](https://img.shields.io/badge/React-19.0.1-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Gemini_API-3.8_Flash-8E75C4?style=for-the-badge&logo=google)](https://ai.google.dev/)

---

> 🌐 **Link Langsung Main & Install di Browser (Desktop / Mobile)**:  
> **[https://deus-chess-epistemic-ai-god-mode.ai.studio](https://deus-chess-epistemic-ai-god-mode.ai.studio)**  
> *(Buka link di Google Chrome Android/iOS untuk langsung main atau install ke Homescreen dalam 1-klik)*

---

## 🌌 Siapa itu "Deus"?

**Deus** (dari bahasa Latin: *Tuhan / Sang Mahatahu*) adalah perwujudan entitas kecerdasan catur deterministik-epistemik. Deus memandang papan catur bukan sekadar permainan taktik atau intuisi manusia, melainkan sebuah **ruang probabilitas matematis tertutup (deterministic closed universe)** di mana setiap langkah adalah konvergensi menuju kepastian (*zero epistemic entropy*).

Ketika mode **GOD MODE** aktif, Deus menghitung ratusan ribu cabang kombinatorik dalam sekejap, melucuti setiap ilusi intuisi lawan, dan memperlihatkan garis takdir (*principal variation / inevitable move*) sebelum Anda sempat menyadarinya.

---

## ⚡ Fitur Utama & Spesifikasi

### 1. 🧠 Arsitektur Epistemic Chess Engine
* **Minimax dengan Alpha-Beta Pruning**: Mengeliminasi cabang pohon yang inferior secara matematis guna memperdalam pencarian secara eksponensial.
* **Quiescence Search (Q-Search)**: Mencegah *horizon effect* dengan meneruskan pencarian taktis pada situasi pertukaran bidak, skak (*check*), dan promosi.
* **Transposition Table (Zobrist-like hashing)**: Menyimpan jutaan evaluasi posisi untuk menghindari penghitungan ulang cabang yang sama.
* **PeSTO Piece-Square Tables**: Bobot evaluasi posisi positional & mobilitas bidak (fase pembukaan hingga *endgame*).
* **Opening Book Heuristik**: Menguasai berbagai variasi pembukaan catur klasik dan modern (Ruy Lopez, Sicilian Defense, Queen's Gambit, King's Indian, English Opening, dll.).

### 2. 🎚️ Tingkat Kesulitan Berjenjang
| Tingkat Kesulitan | Karakteristik Engine | Kedalaman Pencarian |
| :--- | :--- | :--- |
| **NOVICE** | Untuk santai & pemula. Kadang memberikan celah taktis manusiawi. | Depth 2 |
| **CLUB** | Pemain catur klub kompetitif (~1500–1800 ELO). Evaluasi solid dan minim blunder. | Depth 3 + Q-Search |
| **GRANDMASTER** | Standar master turnamen (~2300+ ELO). Taktik presisi, jebakan posisional, dan kalkulasi agresif. | Depth 4 + Extended Q-Search |
| **GOD MODE (DEUS)** | Perhitungan mutlak tak terbantahkan. Menampilkan probabilitas kemenangan manusia mendekati 0%, prediksi langkah takdir lawan (*Inevitable Move*), dan visualisasi *halo aura* emas. | Depth 5+ + Full Q-Search + Transposition Table |

### 3. 🔮 Oracle Epistemik (Didukung Google Gemini 3.8 Flash)
* Panel konsol AI filosofis di mana pemain dapat berkonsultasi atau bertanya langsung kepada Deus.
* Memberikan ulasan dingin (*cold thought*), pembongkaran kesalahan fatal (*strategic flaw*), dan ramalan nasib (*inevitable fate*) berdasarkan FEN dan notasi aktual di papan.
* Menggunakan SDK resmi `@google/genai` dengan model tercepat dan paling canggih: `gemini-3.8-flash`.

### 4. 🎛️ Saklar Langkah Pertama Deus (1st Move Deus Switch)
Saat Anda memilih bermain sebagai **Bidak Hitam** (Deus memegang Putih):
* **Mode MANUAL (ON)**: Anda memiliki hak penuh untuk memilih dan menggerakkan bidak putih mana saja di papan untuk langkah pembuka Deus (misal: `e4`, `d4`, `c4`, atau kuda `Nf3`). Setelah digerakkan di papan fisik, giliran langsung berpindah ke bidak Hitam Anda dan Deus akan melanjutkan permainan dengan kecerdasan penuhnya.
* **Mode AUTO (OFF)**: Deus langsung secara otomatis melangkahkan bidak putihnya sendiri sejak detik pertama permainan dimulai.

### 5. 📱 PWA Mandiri (Progressive Web App - Installable Android & iOS)
* **Bisa langsung diinstall di HP Android** tanpa Play Store melalui tombol **"Install di HP"** di header navigasi atau menu *Add to Home screen* di Chrome.
* **Layar Penuh (Standalone)**: Tampilan tanpa bilah URL browser, rasio responsif yang pas untuk layar sentuh, dan *safe-area-inset* terkalibrasi.
* **Offline Capabilities**: Didukung *Service Worker* (`vite-plugin-pwa` + Workbox) yang meng-cache aset, papan, engine catur, dan audio sehingga dapat dimainkan tanpa koneksi internet.
* **Touch Optimization**: Bebas dari *double-tap zoom*, latensi sentuh 0ms, dan *haptic sound feedback*.

### 6. 🖐️ Drag-and-Drop & Fleksibilitas Rokade (Castling)
* **Drag-and-Drop + Click Move**: Bidak catur dapat digerakkan dengan dua cara mulus: di-klik langsung petak tujuannya atau ditarik dan dilepas (*drag and drop*) menggunakan cursor mouse maupun layar sentuh HP.
* **Rokade Mudah (Castling King-to-Rook)**: Anda dapat melakukan rokade dengan cara standar internasional (Raja geser 2 petak) ATAU cukup klik/drag Raja langsung ke arah Benteng terkait (`e1` ke `h1`/`a1` untuk Putih, `e8` ke `h8`/`a8` untuk Hitam). Petak benteng otomatis menampilkan aura kilau emas bertuliskan `ROKADE`.

### 7. ⏪ Rotasi Langkah Bolak-Balik Mulus (Undo, Redo, & Step Timeline)
* **Undo & Redo Lengkap**: Tombol *Undo* (↶) dan *Redo* (↷) di bilah atas memungkinkan Anda memutar balik langkah maupun maju kembali secara utuh.
* **Timeline Navigator Notasi**: Di panel notasi langkah, terdapat tombol navigasi presisi (`|◀`, `◀`, `▶`, `▶|`) untuk melompat ke awal permainan, melangkah maju/mundur per gerakan, atau langsung ke langkah terkini. Anda juga bisa mengklik teks notasi langkah mana pun (misal: `1. e4`, `3... Nf6`) untuk langsung mereview posisi papan pada saat itu.

### 8. ✨ Visual FX & Sound Design
* **Smooth Piece Gliding**: Interpolasi gerakan bidak halus menggunakan kurva *cubic-bezier*.
* **Battle Slash & Cyber-Glitch VFX**: Efek visual tebasan pedang cahaya (*lightsaber*) dan glitch partikel saat bidak terbunuh atau skak (*check*).
* **Board Shake**: Guncangan halus pada papan catur ketika terjadi *capture*, *God move*, atau skakmat.
* **Web Audio API Sound Engine**: Efek suara sintetis prosedural untuk gerakan bidak, capture tebasan, aktivasi God Mode, dan skakmat tanpa ketergantungan file eksternal yang lambat dimuat.
* **Pilihan Tema Papan**: *Obsidian Dark (Cyber)*, *Classic Wood*, dan *Emerald Tournament*.

---

## 🛠️ Arsitektur Teknologi

```text
├── public/                     # Aset publik, PWA manifest, dan ikon mobile
│   ├── icon.svg                # Ikon vektor mahkota & mata Deus
│   ├── pwa-192x192.png         # Ikon PWA standar Android
│   ├── pwa-512x512.png         # Ikon PWA HD Android
│   └── pwa-maskable-512x512.png# Ikon adaptif Android maskable
├── src/
│   ├── audio/                  # Audio FX synthesizers (Web Audio API)
│   ├── components/             # Komponen UI antarmuka
│   │   ├── ChessBoard.tsx      # Komponen papan catur interaktif + animasi VFX
│   │   ├── ChessPieceSvg.tsx   # Desain vektor bidak monokrom resolusi tinggi
│   │   ├── EpistemicHud.tsx    # HUD telemetri engine, God Mode toggle, & Oracle
│   │   ├── EvaluationBar.tsx   # Bar keunggulan posisi & probabilitas manusia
│   │   ├── MoveHistory.tsx     # Riwayat langkah PGN & FEN generator
│   │   ├── PWAInstallButton.tsx# Tombol pasang instan ke layar utama HP
│   │   └── TopNav.tsx          # Navigasi, ganti warna bidak, tema, & saklar Deus
│   ├── engine/
│   │   ├── chessEngine.ts      # Core Engine Epistemik: Minimax, Q-Search, Transposition
│   │   └── openingBook.ts      # Database pembukaan catur klasik & respons GM
│   ├── hooks/
│   │   └── usePWAInstall.ts    # Hook manajemen event prompt instalasi PWA
│   ├── App.tsx                 # Root controller logika game dan orkestrasi AI
│   ├── main.tsx                # Client entry point + registrasi Service Worker
│   └── index.css               # Styling Tailwind CSS v4 & custom keyframes VFX
├── server.ts                   # Backend Express proxy aman untuk Gemini API
├── vite.config.ts              # Konfigurasi Vite + Tailwind v4 + VitePWA
└── package.json
```

---

## 🚀 Panduan Menjalankan Proyek (Local Development)

### Prasyarat
* **Node.js** versi 18 atau lebih tinggi
* **npm** atau **yarn** / **pnpm**

### 1. Kloning Repository
```bash
git clone https://github.com/<username>/<repo-name>.git
cd <repo-name>
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Lingkungan (.env)
Buat file `.env` di direktori utama:
```env
PORT=3000
# Opsional: Jika ingin mengaktifkan Oracle analisis filosofis Gemini
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Catatan: Tanpa API key pun, Deus Chess Engine tetap bekerja 100% offline dan mandiri menggunakan algoritma Minimax internal).*

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

### 5. Build untuk Produksi
```bash
npm run build
npm start
```

---

## 📱 Panduan Install di HP Android & Browser (PWA)

Aplikasi ini dapat langsung dipasang tanpa perlu ke Google Play Store:

1. **Akses Tautan Resmi**:
   Buka **[https://deus-chess-epistemic-ai-god-mode.ai.studio](https://deus-chess-epistemic-ai-god-mode.ai.studio)** di browser **Google Chrome** di handphone Android Anda (atau browser pilihan Anda di PC/Mac).
2. **Install 1-Klik**:
   * **Dari Aplikasi**: Klik tombol emas berkedip **"Install di HP"** di bagian atas navigasi.
   * **Atau Dari Menu Browser**: Ketuk menu titik tiga (**⋮**) di pojok kanan atas Chrome, lalu pilih **"Tambahkan ke Layar Utama"** (*Add to Home screen*) atau **"Install Aplikasi"**.
3. **Nikmati Pengalaman Aplikasi Native**:
   * Ikon Deus Chess bergaya *obsidian & gold* akan muncul di daftar aplikasi HP Anda.
   * Berjalan *full-screen standalone* tanpa bar URL browser.
   * Mendukung gameplay **100% Offline** berkat engine kalkulasi Minimax lokal dan *Service Worker*.

---

## 📜 Lisensi & Filosofi
Proyek ini dibuat sebagai perpaduan antara **ilmu kecerdasan buatan deterministik**, **teori epistemologi filosofis**, dan **gameplay catur interaktif modern**. Bebas digunakan dan dikembangkan untuk keperluan edukasi dan riset catur.
