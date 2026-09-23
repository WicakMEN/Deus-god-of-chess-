import React from 'react';
import { X, BookOpen, Flame, Cpu, CheckCircle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhilosophyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 max-w-2xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-400" />
            <h2 className="font-display font-bold text-base tracking-wide text-white uppercase">
              Epistemologi Catur: Dari Deep Blue (1997) ke God Mode
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 text-xs font-mono"
          >
            ✕ Tutup
          </button>
        </div>

        <div className="space-y-4 text-xs font-mono text-neutral-300 leading-relaxed">
          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
            <span className="text-amber-400 font-bold block mb-1">1. Mengapa Manusia Pasti Kalah?</span>
            <p>
              Pada 1997, Garry Kasparov dikalahkan oleh IBM Deep Blue (~2750 ELO). Deep Blue mengandalkan
              perhitungan kasar 200 juta posisi per detik. Namun manusia masih memiliki harapan karena
              komputer era itu lemah dalam penilaian posisi abstrak jangka panjang.
            </p>
          </div>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
            <span className="text-rose-400 font-bold block mb-1">2. Logika Paling Dingin & Probabilistik Epistemik</span>
            <p>
              God Mode dalam Deus Chess beroperasi pada ELO 3500+. Ini memadukan pemangkasan Alpha-Beta tingkat tinggi,
              tabel evaluasi PeSTO, pencarian Quiescence bebas horizon effect, serta reduksi entropi Shannon secara
              real-time. Setiap langkah manusia memicu keruntuhan probabilistik (probabilistic wave collapse)
              di mana cabang pertahanan terpangkas hingga tidak ada satupun jalur kemenangan biologis yang tersisa.
            </p>
          </div>

          <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
            <span className="text-teal-400 font-bold block mb-1">3. Ilusi Intuisi Biologis</span>
            <p>
              Grandmaster manusia mengandalkan emosi, pola heuristik, dan stamina. God Mode tidak memiliki detak jantung,
              tidak mengenal rasa takut, dan tidak bisa digertak. Setiap gerakan adalah hasil dari kalkulasi tanpa ampun
              terhadap hukum matematis catur yang telah tertutup sempurna.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-mono font-semibold"
          >
            Kembali ke Papan
          </button>
        </div>
      </div>
    </div>
  );
};

export const RulesModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 max-w-xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-base tracking-wide text-white uppercase">
              Aturan & Mekanisme Catur
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 text-xs font-mono"
          >
            ✕ Tutup
          </button>
        </div>

        <div className="space-y-3 text-xs font-mono text-neutral-300 leading-relaxed">
          <div className="border-l-2 border-amber-400 pl-3 py-1">
            <span className="font-bold text-white block">Tujuan Utama</span>
            Raja lawan harus diserang dan tidak memiliki langkah legal untuk lolos (Skakmat / Checkmate).
          </div>

          <div className="border-l-2 border-teal-400 pl-3 py-1">
            <span className="font-bold text-white block">Rokade (Castling)</span>
            Langkah khusus raja dan benteng jika belum pernah bergerak dan tidak ada ancaman skak di antaranya.
          </div>

          <div className="border-l-2 border-rose-400 pl-3 py-1">
            <span className="font-bold text-white block">En Passant & Promosi</span>
            Pion yang melangkah 2 petak dapat ditangkap secara silang segera di langkah berikutnya. Pion di petak akhir
            dapat dipromosikan menjadi Menteri (Queen), Benteng, Gajah, atau Kuda.
          </div>

          <div className="border-l-2 border-neutral-500 pl-3 py-1">
            <span className="font-bold text-white block">Remis (Draw)</span>
            Stalemate (tidak ada langkah legal tapi tidak sedang skak), aturan 50 langkah tanpa makan/pion, atau
            pengulangan posisi 3 kali.
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-mono font-semibold"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
