import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  FileCheck 
} from 'lucide-react';
import { parseExcelWorkbook, ParseResult } from '../utils/excelParser';
import { RespondentRecord } from '../types/survey';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (records: RespondentRecord[], fileName: string) => void;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedSummary, setParsedSummary] = useState<ParseResult | null>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Selecteer een geldig Excel-bestand (.xlsx of .xls).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelWorkbook(buffer, file.name);
      setParsedSummary(result);
    } catch (err: any) {
      setError(err?.message || 'Er is een fout opgetreden bij het inlezen van het Excel-bestand.');
      setParsedSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = () => {
    if (parsedSummary) {
      onDataLoaded(parsedSummary.records, parsedSummary.fileName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden">
        <div className="h-1.5 w-full bg-[#E50056]" />
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#111111] text-white">
              <FileSpreadsheet className="w-5 h-5 text-[#E50056]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111111]">
                Excel Vragenlijst Importeren
              </h2>
              <p className="text-xs text-zinc-500">
                Upload het ingevulde 'Invoerblad' van de Zelfregulatietool
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-[#111111] hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Instructies */}
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#E50056] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#111111] mb-1">Verwachte structuur in het bestand:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Werkblad: <strong>Invoerblad</strong></li>
                <li>Kolom <strong>Klas / groep</strong>: Bevat "HAN" (studenten) of studentnummer (leerlingen)</li>
                <li>Kolommen <strong>Vraag 1 t/m Vraag 75</strong>: Bevatten scores van 1 t/m 5</li>
              </ul>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-[#E50056] bg-[#E50056]/5'
                : 'border-zinc-300 hover:border-[#E50056] bg-zinc-50/50'
            }`}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.xlsx,.xls';
              input.onchange = (e: any) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              };
              input.click();
            }}
          >
            <Upload className="w-8 h-8 mx-auto text-[#E50056] mb-2" />
            <p className="text-sm font-bold text-[#111111]">
              Sleep je Excel-bestand hierheen of klik om te bladeren
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Ondersteunt .xlsx en .xls bestanden
            </p>
          </div>

          {isLoading && (
            <div className="text-center py-3 text-xs font-medium text-zinc-600 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-[#E50056] border-t-transparent rounded-full animate-spin"></span>
              Excel-bestand analyseren...
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-[#E50056]/30 text-xs text-[#E50056] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {parsedSummary && (
            <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-300 text-xs text-[#111111] space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Bestand succesvol geanalyseerd
              </div>
              <p className="text-zinc-600">
                <strong className="text-[#111111] font-mono-nums">{parsedSummary.totalRespondents}</strong> geldige respondenten gevonden in{' '}
                <strong className="text-[#111111] font-mono-nums">{parsedSummary.groups.length}</strong> groepen:
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[11px] font-mono-nums text-zinc-600">
                {parsedSummary.groups.map((g, i) => (
                  <span key={g} className={g.toUpperCase() === 'HAN' ? 'font-bold text-[#E50056]' : 'font-semibold text-[#111111]'}>
                    {g.toUpperCase() === 'HAN' ? 'Docenten (HAN)' : `Student ${g}`}
                    {i < parsedSummary.groups.length - 1 ? ' ·' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            Annuleren
          </button>
          {parsedSummary && (
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-lg bg-[#E50056] hover:bg-[#C20048] text-white text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" />
              Toepassen in Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
