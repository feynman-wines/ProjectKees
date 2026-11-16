import React from 'react';
import { Upload, RotateCcw, Download } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  isCustomData: boolean;
  fileName?: string;
  totalRespondents: number;
  onOpenUpload: () => void;
  onResetToSample: () => void;
  onExportExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isCustomData,
  fileName,
  totalRespondents,
  onOpenUpload,
  onResetToSample,
  onExportExcel,
}) => {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
      {/* HAN kenmerkende rode bovenlijn */}
      <div className="h-1 w-full bg-[#E50056]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: HAN Merknaam (strak, één regel) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-2.5 py-1 bg-[#E50056] text-white font-display font-extrabold text-sm tracking-tight rounded-sm select-none">
            HAN
          </div>
          <span className="font-display font-bold text-[#111111] text-base sm:text-lg tracking-tight whitespace-nowrap">
            Zelfregulatietool Analyse
          </span>
        </div>

        {/* Zone 2: Dataset status (unboxed typografie) */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-500 whitespace-nowrap truncate">
          <span className="font-medium text-zinc-700">
            {isCustomData ? fileName || 'Eigen dataset' : 'Voorbeeld-dataset'}
          </span>
          <span aria-hidden="true">&middot;</span>
          <span className="font-mono-nums font-semibold text-[#111111]">
            {totalRespondents} respondenten
          </span>
        </div>

        {/* Zone 3: Acties */}
        <div className="flex items-center gap-2 shrink-0">
          {isCustomData && (
            <button
              onClick={onResetToSample}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-zinc-600 hover:text-[#111111] hover:bg-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Terug naar voorbeeld-dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Voorbeeld</span>
            </button>
          )}

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-zinc-300 text-[#111111] hover:border-[#111111] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Exporteer resultaten naar Excel"
          >
            <Download className="w-3.5 h-3.5 text-[#111111]" />
            <span className="hidden sm:inline">Exporteer Excel</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#E50056] text-white hover:bg-[#C20048] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Excel-bestand uploaden"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Excel</span>
          </button>

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
