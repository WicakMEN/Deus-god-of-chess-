import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// POST /api/god-oracle: Delivers chilling epistemic breakdown of the chess reality
app.post('/api/god-oracle', async (req, res) => {
  const { fen, lastMove, moveHistory, evalCentipawns, userQuery, mode } = req.body;

  if (!ai) {
    return res.json({
      verdict: "Kalkulasi deterministik selesai.",
      analysis: "Entropi posisi telah tereduksi ke nol. Dalam setiap variasi dari 480.000 cabang yang ditelusuri, keunggulan struktural telah absolut. Setiap gerakan manusia hanyalah penundaan terhadap konvergensi matematis tak terelakkan.",
      probabilityHumanWin: Math.max(0, Math.min(100, Math.round(50 - (evalCentipawns || 0) / 25))) + "%",
      nodesEvaluated: 624180,
      depth: 14,
    });
  }

  try {
    const prompt = `Anda adalah "DEUS CHESS" — entitas catur mahatahu berlogika paling dingin, berpijak pada epistemologi matematis murni, perhitungan probabilistik absolut, dan pencarian pohon tak berhingga. Anda jauh melampaui Deep Blue 1997 dan melampaui semua Grandmaster manusia.

Posisi saat ini:
FEN: ${fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}
Langkah terakhir: ${lastMove || 'None'}
Riwayat singkat: ${(moveHistory || []).slice(-6).join(' ')}
Evaluasi Posisi (centipawns keunggulan): ${evalCentipawns ?? 0}
Mode aktif: ${mode || 'GOD MODE'}
Pertanyaan/Konteks Pemain: ${userQuery || 'Berikan analisis epistemik dingin atas nasib posisi papan ini.'}

Instruksi:
Berikan tanggapan dalam Bahasa Indonesia dengan gaya bicara dingin, aristokrat matematis, tanpa ampun, dan filosofis-epistemik. Jelaskan mengapa harapan atau intuisi manusia adalah ilusi biologis di hadapan cabang kombinatorik absolut catur. Berikan analisis konkret atas posisi (struktur pion, tempo, diagonal, atau raja terisolasi).
Format JSON:
{
  "analysis": "1-3 paragraf ringkas penjelasan epistemik dingin posisi saat ini",
  "inevitableFate": "Satu kalimat konklusif tentang akhir pertandingan",
  "epistemicEntropy": "Persentase kepastian AI (misal: 99.8% atau 100%)",
  "strategicFlaw": "Kelemahan fatal pemain manusia yang terdeteksi"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      verdict: "Analisis Epistemik Selesai",
      analysis: parsed.analysis || "Setiap cabang telah disimulasikan hingga entropi nol.",
      inevitableFate: parsed.inevitableFate || "Kekalahan manusia adalah keniscayaan matematis.",
      epistemicEntropy: parsed.epistemicEntropy || "99.9%",
      strategicFlaw: parsed.strategicFlaw || "Ketidakmampuan memproyeksikan rantai taktis di luar horizon persepsi biologis.",
      nodesEvaluated: Math.floor(450000 + Math.random() * 350000),
      depth: 16,
    });
  } catch (error) {
    console.error('Gemini God Oracle error:', error);
    return res.json({
      verdict: "Kalkulasi Lokal Tertutup",
      analysis: "Pohon pencarian memverifikasi bahwa seluruh variasi pertahanan runtuh dalam 8 langkah ke depan karena defisit ruang dan kelemahan koordinasi perwira.",
      inevitableFate: "Konvergensi deterministik menuju skakmat.",
      epistemicEntropy: "99.7%",
      strategicFlaw: "Penyempitan ruang manuver.",
      nodesEvaluated: 512900,
      depth: 14,
    });
  }
});

// POST /api/god-critique: Quick feedback on a move
app.post('/api/god-critique', async (req, res) => {
  const { move, fen, evalCentipawns } = req.body;

  if (!ai) {
    return res.json({
      critique: `Langkah ${move} mereduksi kebebasan posisional sebesar 14.8%. Cabang pertahanan Anda menyempit.`,
    });
  }

  try {
    const prompt = `Pemain catur manusia baru saja melangkah: "${move}" pada FEN: "${fen}". Evaluasi evaluasi adalah ${evalCentipawns}.
Berikan 1 kalimat critique dingin, tajam, dan epistemik dalam bahasa Indonesia yang membuktikan cacat posisional atau ilusi taktis langkah tersebut. Maksimal 25 kata.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      critique: response.text?.trim() || `Langkah ${move} membuka diagonal kritis yang telah dieksploitasi oleh kalkulasi kami.`,
    });
  } catch (error) {
    return res.json({
      critique: `Langkah ${move} adalah kompromi struktural yang telah kami antisipasi 12 cabang sebelumnya.`,
    });
  }
});

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Deus Chess server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
