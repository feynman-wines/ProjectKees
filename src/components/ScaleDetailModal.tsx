import React from 'react';
import { 
  X, 
  Lightbulb, 
  CheckCircle2, 
  Info, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { ScaleDefinition, QuestionItem, ComparisonItem } from '../types/survey';

interface ScaleDetailModalProps {
  scale: ScaleDefinition | null;
  comparisonItem: ComparisonItem | null;
  questions: QuestionItem[];
  questionAverages: Record<number, number>;
  questionStdDevs: Record<number, number>;
  currentMode: 'total' | 'han' | 'student';
  selectedStudentNumber: string;
  onClose: () => void;
}

export const ScaleDetailModal: React.FC<ScaleDetailModalProps> = ({
  scale,
  comparisonItem,
  questions,
  questionAverages,
  questionStdDevs,
  currentMode,
  selectedStudentNumber,
  onClose,
}) => {
  if (!scale || !comparisonItem) return null;

  const relevantQuestions = questions.filter((q) => scale.questions.includes(q.number));

  const activeScore = currentMode === 'student'
    ? comparisonItem.ownScore ?? 0
    : currentMode === 'han'
    ? comparisonItem.hanScore
    : comparisonItem.totalScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {scale.categoryName}
              </span>
              <span className="text-xs text-slate-400">
                {scale.questions.length} vragen
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {scale.name}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {scale.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Kernstatistieken */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
              <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">
                {currentMode === 'student' ? `Score Klas (${selectedStudentNumber})` : currentMode === 'han' ? 'Score Groep HAN' : 'Gemiddelde Totaal'}
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-blue-950">
                  {activeScore.toFixed(2)}
                </span>
                <span className="text-xs text-blue-600">/ 5.0</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Benchmark Totaal (Alle leerlingen)
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {comparisonItem.totalScore.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500">/ 5.0</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
                Groep "HAN" (Docenten)
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-emerald-950">
                  {comparisonItem.hanScore.toFixed(2)}
                </span>
                <span className="text-xs text-emerald-600">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Handelingsadviezen voor de student-docent */}
          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              Didactische Tips & Aanbevelingen voor in de les
            </div>
            <ul className="space-y-2">
              {scale.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-amber-950 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vragen in deze schaal */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              Vragen in deze schaal ({relevantQuestions.length})
            </h3>
            <div className="space-y-2.5">
              {relevantQuestions.map((q) => {
                const avg = questionAverages[q.number] || 0;
                const std = questionStdDevs[q.number] || 0;
                return (
                  <div
                    key={q.number}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded-md shrink-0">
                        Vraag {q.number}
                      </span>
                      <p className="text-slate-800 font-medium leading-relaxed">
                        {q.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Gemiddelde</span>
                        <span className="font-bold text-slate-900 text-sm">{avg.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Standaardafw.</span>
                        <span className="font-medium text-slate-600">{std.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition cursor-pointer"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
