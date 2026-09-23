import React, { useState } from 'react';
import { Smartphone, Download, Check, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed and running in standalone mobile mode, hide the install prompt button
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>Terinstall di HP</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 4000);
      }
    } else {
      // Jika browser belum melempar prompt native (misal di iframe preview atau Safari),
      // buka panduan langsung 1-klik untuk instal ke layar utama Android / iOS
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-mono font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer animate-pulse"
        title="Install Deus Chess sebagai aplikasi di HP Android"
      >
        <Smartphone className="w-4 h-4 text-neutral-950" />
        <span className="inline">Install di HP</span>
      </button>

      {/* Panduan Instalasi Instan untuk Android & iOS */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-700 p-6 shadow-2xl text-neutral-100 relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Install Deus Chess di Android
                </h3>
                <p className="text-xs font-mono text-neutral-400">
                  Aplikasi mandiri layar penuh (PWA) tanpa Play Store
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-neutral-300 font-sans border-y border-neutral-800 py-4 my-2">
              <div className="flex items-start gap-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-neutral-950 font-bold font-mono flex items-center justify-center text-xs">
                  1
                </span>
                <div>
                  <p className="font-medium text-white">Buka di Browser Chrome Android</p>
                  <p className="text-neutral-400 mt-0.5">
                    Buka link aplikasi ini di browser Chrome di handphone Android Anda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-neutral-950 font-bold font-mono flex items-center justify-center text-xs">
                  2
                </span>
                <div>
                  <p className="font-medium text-white">Klik Tombol Titik Tiga (⋮) Menu Chrome</p>
                  <p className="text-neutral-400 mt-0.5">
                    Ketuk menu titik tiga di pojok kanan atas browser Chrome.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-400 text-neutral-950 font-bold font-mono flex items-center justify-center text-xs">
                  3
                </span>
                <div>
                  <p className="font-medium text-white">
                    Pilih &quot;Tambahkan ke Layar Utama&quot; atau &quot;Install Aplikasi&quot;
                  </p>
                  <p className="text-neutral-400 mt-0.5">
                    Ikon Deus Chess akan langsung terpasang di layar utama Android Anda seperti aplikasi asli!
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono font-bold text-xs transition cursor-pointer"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
