import React from 'react';
import { Upload, Trash2, Download } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  hasData: boolean;
  isCustomData: boolean;
  fileName?: string;
  totalRespondents: number;
  onOpenUpload: () => void;
  onClearData: () => void;
  onExportExcel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasData,
  isCustomData,
  fileName,
  totalRespondents,
  onOpenUpload,
  onClearData,
  onExportExcel,
}) => {
  return (
    <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 w-full">
      {/* HAN kenmerkende rode bovenlijn */}
      <div className="h-1 w-full bg-[#E50056]" />
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Zone 1: HAN Merknaam */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#E50056] text-white font-display font-extrabold text-xs sm:text-sm tracking-tight rounded-sm select-none shrink-0">
            HAN
          </div>
          <span className="font-display font-bold text-[#111111] text-sm sm:text-lg tracking-tight truncate">
            Zelfregulatietool<span className="hidden sm:inline"> Analyse</span>
          </span>
        </div>

        {/* Zone 2: Dataset status */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-500 whitespace-nowrap truncate">
          <span className="font-medium text-zinc-700">
            {!hasData
              ? 'Geen dataset geladen'
              : isCustomData
              ? fileName || 'Eigen dataset'
              : 'Vragenlijst 1-350'}
          </span>
          <span aria-hidden="true">&middot;</span>
          <span className="font-mono-nums font-semibold text-[#111111]">
            {totalRespondents} respondenten
          </span>
        </div>

        {/* Zone 3: Acties */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {hasData && (
            <button
              onClick={onClearData}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-zinc-600 hover:text-[#E50056] hover:bg-rose-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Alle huidige data wissen"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Data wissen</span>
            </button>
          )}

          {hasData && (
            <button
              onClick={onExportExcel}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-zinc-300 text-[#111111] hover:border-[#111111] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Exporteer resultaten naar Excel"
              aria-label="Exporteer Excel"
            >
              <Download className="w-3.5 h-3.5 text-[#111111] shrink-0" />
              <span className="hidden sm:inline">Exporteer Excel</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 text-xs font-semibold rounded-lg bg-[#E50056] text-white hover:bg-[#C20048] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Excel-bestand uploaden"
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">Excel</span>
            <span className="hidden sm:inline">Upload Excel</span>
          </button>

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
