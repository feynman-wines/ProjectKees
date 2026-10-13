import React from 'react';
import { 
  GraduationCap, 
  Upload, 
  RotateCcw, 
  Download, 
  FileSpreadsheet, 
  BarChart3 
} from 'lucide-react';
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
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Titel */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-900/20">
            <GraduationCap className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-base leading-tight">
                Zelfregulatietool Analyse
              </h1>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                HAN Nijmegen
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Lerarenopleiding &bull; Vragenlijst Zelfregulerend Leren
            </p>
          </div>
        </div>

        {/* Dataset status & Actieknoppen */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            <span>{isCustomData ? `Bestand: ${fileName || 'Geüpload'}` : 'Voorbeeld-dataset (Actief)'}</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-blue-700 font-semibold">{totalRespondents} respondenten</span>
          </div>

          {/* Upload knop */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer"
            title="Excel-bestand uploaden"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Upload Excel</span>
          </button>

          {/* Reset naar voorbeeld */}
          {isCustomData && (
            <button
              onClick={onResetToSample}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Terug naar voorbeeld-dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Voorbeeld</span>
            </button>
          )}

          {/* Export Excel */}
          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
            title="Exporteer resultaten naar Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Exporteer</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
