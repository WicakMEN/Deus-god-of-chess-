# ♟️ Deus Chess: Epistemic AI & God Mode

[![Progressive Web App](https://img.shields.io/badge/PWA-Ready%20%26%20Installable-gold?style=for-the-badge&logo=pwa)](https://github.com/)
[![React 19](https://img.shields.io/badge/React-19.0.1-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini API](https://img.shields.io/badge/Gemini_API-3.8_Flash-8E75C4?style=for-the-badge&logo=google)](https://ai.google.dev/)

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

### 6. ✨ Visual FX & Sound Design
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

## 📱 Panduan Install di HP Android (PWA)

1. Buka tautan situs aplikasi di **Google Chrome** di handphone Android Anda.
2. Klik tombol emas **"Install di HP"** di bilah atas aplikasi, atau buka menu **titik tiga (⋮)** di pojok kanan atas browser Chrome dan pilih **"Tambahkan ke Layar Utama" / "Install Aplikasi"**.
3. Aplikasi Deus Chess kini terpasang langsung di layar beranda (*Home Screen*) HP Anda, siap dimainkan kapan saja secara *offline*.

---

## 📜 Lisensi & Filosofi
Proyek ini dibuat sebagai perpaduan antara **ilmu kecerdasan buatan deterministik**, **teori epistemologi filosofis**, dan **gameplay catur interaktif modern**. Bebas digunakan dan dikembangkan untuk keperluan edukasi dan riset catur.
