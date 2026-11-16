import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#111111] px-2.5 sm:px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#E50056] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        title="Installeer als app op je apparaat"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="sm:hidden">App</span>
        <span className="hidden sm:inline">Installeer App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2.5 sm:px-3 py-2 text-xs font-semibold text-[#111111] hover:border-[#111111] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="Zet op beginscherm"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#E50056] shrink-0" />
          <span className="sm:hidden">App</span>
          <span className="hidden sm:inline">Zet op beginscherm</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl border border-zinc-200 relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-[#111111] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-lg bg-[#E50056] text-white flex items-center justify-center mb-3">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111111]">Installeren op iPhone / iPad</h3>
              <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
                1. Tik onderaan in Safari op de <strong>Deel-knop</strong> (vierkantje met pijl omhoog).<br />
                2. Scroll naar beneden en tik op <strong>Zet op beginscherm</strong>.<br />
                3. Tik rechtsboven op <strong>Voeg toe</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-lg bg-[#111111] py-2.5 text-xs font-semibold text-white hover:bg-[#E50056] transition-colors cursor-pointer"
              >
                Begrepen
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
