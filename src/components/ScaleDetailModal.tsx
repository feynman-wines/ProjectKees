import React from 'react';
import { 
  X, 
  Lightbulb, 
  FileText, 
  ListOrdered
} from 'lucide-react';
import { ScaleDefinition, QuestionItem, ComparisonItem } from '../types/survey';

interface ScaleDetailModalProps {
  scale: ScaleDefinition | null;
  comparisonItem: ComparisonItem | null;
  questions: QuestionItem[];
  questionAverages: Record<number, number>;
  questionStdDevs: Record<number, number>;
  totalQuestionAverages: Record<number, number>;
  hanQuestionAverages: Record<number, number>;
  currentMode: 'total' | 'han' | 'student';
  selectedStudentNumber: string;
  onClose: () => void;
  onOpenInQuestionsTab?: (scaleName: string) => void;
}

export const ScaleDetailModal: React.FC<ScaleDetailModalProps> = ({
  scale,
  comparisonItem,
  questions,
  questionAverages,
  questionStdDevs,
  totalQuestionAverages,
  hanQuestionAverages,
  currentMode,
  selectedStudentNumber,
  onClose,
  onOpenInQuestionsTab,
}) => {
  if (!scale || !comparisonItem) return null;

  const relevantQuestions = questions.filter((q) => scale.questions.includes(q.number));

  const hasActiveScore = currentMode === 'student'
    ? comparisonItem.ownScore !== null
    : currentMode === 'han'
    ? comparisonItem.hanScore > 0
    : comparisonItem.totalScore > 0;

  const activeScore = currentMode === 'student'
    ? comparisonItem.ownScore ?? 0
    : currentMode === 'han'
    ? comparisonItem.hanScore
    : comparisonItem.totalScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header (HAN Zwart met rode accentlijn) */}
        <div className="h-1.5 w-full bg-[#E50056]" />
        <div className="p-6 bg-[#111111] text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1.5">
              <span className="font-semibold text-[#E50056]">{scale.categoryName}</span>
              <span aria-hidden="true">&middot;</span>
              <span className="font-mono-nums">{scale.questions.length} vragen</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {scale.name}
            </h2>
            <p className="text-xs text-zinc-300 mt-1 max-w-xl leading-relaxed">
              {scale.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Kernstatistieken */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-semibold text-[#E50056] block">
                {currentMode === 'student' ? `Klas (${selectedStudentNumber})` : currentMode === 'han' ? 'Groep HAN' : 'Gemiddelde Totaal'}
              </span>
              <div className="mt-1 flex items-baseline gap-1 font-mono-nums">
                {hasActiveScore ? (
                  <>
                    <span className="text-3xl font-extrabold text-[#111111]">
                      {activeScore.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-500">/ 5.0</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-zinc-400 py-1.5">
                    Niet ingevuld
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-semibold text-zinc-500 block">
                Totaal (Alle leerlingen)
              </span>
              <div className="mt-1 flex items-baseline gap-1 font-mono-nums">
                <span className="text-3xl font-extrabold text-[#111111]">
                  {comparisonItem.totalScore.toFixed(2)}
                </span>
                <span className="text-xs text-zinc-500">/ 5.0</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-semibold text-[#111111] block">
                Groep "HAN" (Docenten)
              </span>
              <div className="mt-1 flex items-baseline gap-1 font-mono-nums">
                <span className="text-3xl font-extrabold text-[#111111]">
                  {comparisonItem.hanScore.toFixed(2)}
                </span>
                <span className="text-xs text-zinc-500">/ 5.0</span>
              </div>
            </div>
          </div>

          {/* Handelingsadviezen */}
          <div className="p-5 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="flex items-center gap-2 text-[#111111] font-bold text-sm mb-3">
              <Lightbulb className="w-4 h-4 text-[#E50056]" />
              Didactische Tips &amp; Aanbevelingen voor in de les
            </div>
            <ul className="space-y-2">
              {scale.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                  <span className="w-5 h-5 rounded-md bg-[#111111] text-white flex items-center justify-center font-mono-nums font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vragen in deze schaal */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E50056]" />
                Vragen in deze schaal ({relevantQuestions.length})
              </h3>
              {onOpenInQuestionsTab && (
                <button
                  onClick={() => {
                    onOpenInQuestionsTab(scale.name);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E50056] hover:underline cursor-pointer"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  Bekijk antwoordverdeling in Verkenner
                </button>
              )}
            </div>
            <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
              {relevantQuestions.map((q) => {
                const rawAvg = questionAverages[q.number];
                const hasQScore = rawAvg !== undefined;
                const avg = rawAvg ?? 0;
                const std = questionStdDevs[q.number] ?? 0;
                const totalAvg = totalQuestionAverages[q.number] ?? 0;
                const hanAvg = hanQuestionAverages[q.number] ?? 0;
                return (
                  <div
                    key={q.number}
                    className="py-3 px-2 flex flex-col gap-1.5 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono-nums font-bold text-[#E50056] shrink-0">
                          Vraag {q.number}
                        </span>
                        <p className="text-[#111111] font-medium leading-relaxed">
                          {q.text}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 sm:text-right font-mono-nums">
                        <div>
                          <span className="text-[10px] text-zinc-400 block">Gemiddelde</span>
                          <span className="font-bold text-[#111111] text-sm">
                            {hasQScore ? avg.toFixed(2) : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block">Spreiding</span>
                          <span className="font-medium text-zinc-600">
                            {hasQScore ? <>&plusmn; {std.toFixed(2)}</> : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-500 font-mono-nums">
                      <span>Totaal leerlingen: <strong className="text-[#111111]">{totalAvg.toFixed(2)}</strong></span>
                      <span>Groep "HAN": <strong className="text-[#111111]">{hanAvg.toFixed(2)}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#111111] text-white font-semibold text-xs hover:bg-[#E50056] transition-colors cursor-pointer"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
