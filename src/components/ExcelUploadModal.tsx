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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Excel Vragenlijst Importeren
              </h2>
              <p className="text-xs text-slate-500">
                Upload het ingevulde 'Invoerblad' van de Zelfregulatietool
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Instructies */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Verwachte structuur in het bestand:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800">
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
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
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
            <Upload className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <p className="text-sm font-semibold text-slate-900">
              Sleep je Excel-bestand hierheen of klik om te bladeren
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Ondersteunt .xlsx en .xls bestanden
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-3 text-xs font-medium text-slate-600 flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              Excel-bestand analyseren...
            </div>
          )}

          {/* Foutmelding */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Succesvol ingelezen samenvatting */}
          {parsedSummary && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Bestand succesvol geanalyseerd!
              </div>
              <p>
                <strong>{parsedSummary.totalRespondents}</strong> geldige respondenten gevonden in{' '}
                <strong>{parsedSummary.groups.length}</strong> groepen.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {parsedSummary.groups.map((g) => (
                  <span
                    key={g}
                    className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                      g.toUpperCase() === 'HAN'
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {g.toUpperCase() === 'HAN' ? 'Docenten (HAN)' : `Student: ${g}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Annuleren
          </button>
          {parsedSummary && (
            <button
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-1.5"
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
