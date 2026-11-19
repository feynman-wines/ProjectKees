import React from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { ComparisonItem, ScaleDefinition } from '../types/survey';

interface PedagogicalInsightsProps {
  comparisonData: ComparisonItem[];
  scales: ScaleDefinition[];
  currentMode: 'total' | 'han' | 'student';
  selectedStudentNumber: string;
  onSelectScale: (scale: ScaleDefinition) => void;
}

export const PedagogicalInsights: React.FC<PedagogicalInsightsProps> = ({
  comparisonData,
  scales,
  currentMode,
  selectedStudentNumber,
  onSelectScale,
}) => {
  const scoredItems = comparisonData
    .map((item) => {
      const score = currentMode === 'student'
        ? item.ownScore ?? 0
        : currentMode === 'han'
        ? item.hanScore
        : item.totalScore;
      return { ...item, activeScore: score };
    })
    .filter((item) => item.activeScore > 0);

  const sortedByScore = [...scoredItems].sort((a, b) => b.activeScore - a.activeScore);
  const topStrengths = sortedByScore.slice(0, 3);
  const topGrowthAreas = sortedByScore.slice(-3).reverse();

  const largestGapsWithHan = [...scoredItems]
    .filter((item) => item.deltaWithHan !== null)
    .sort((a, b) => Math.abs(b.deltaWithHan || 0) - Math.abs(a.deltaWithHan || 0))
    .slice(0, 2);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 sm:p-6 mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Compass className="w-5 h-5 text-[#E50056]" />
        <h2 className="text-xl font-bold text-[#111111]">
          Pedagogische Analyse &amp; Lesadviezen
        </h2>
      </div>
      <p className="text-xs text-zinc-500 mb-6">
        Automatisch gegenereerde didactische inzichten voor {currentMode === 'student' ? `klas ${selectedStudentNumber}` : currentMode === 'han' ? 'groep HAN' : 'het totaal van alle leerlingen'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sterke punten */}
        <div className="pt-4 border-t-2 border-[#111111]">
          <div className="flex items-center gap-2 text-[#111111] font-bold text-sm mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Sterke punten (Hoogste scores)
          </div>
          <div className="divide-y divide-zinc-200">
            {topStrengths.map((item) => {
              const def = scales.find((s) => s.id === item.scaleId);
              return (
                <div
                  key={item.scaleId}
                  onClick={() => def && onSelectScale(def)}
                  className="py-3 hover:bg-zinc-50 px-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-semibold text-sm text-[#111111] block">
                      {item.scaleName}
                    </span>
                    <span className="text-xs text-zinc-500 block line-clamp-1">
                      {def?.description}
                    </span>
                  </div>
                  <span className="text-base font-mono-nums font-bold text-[#111111] shrink-0">
                    {item.activeScore.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ontwikkelkansen */}
        <div className="pt-4 border-t-2 border-[#E50056]">
          <div className="flex items-center gap-2 text-[#111111] font-bold text-sm mb-3">
            <AlertCircle className="w-4 h-4 text-[#E50056]" />
            Ontwikkelkansen (Laagste scores)
          </div>
          <div className="divide-y divide-zinc-200">
            {topGrowthAreas.map((item) => {
              const def = scales.find((s) => s.id === item.scaleId);
              return (
                <div
                  key={item.scaleId}
                  onClick={() => def && onSelectScale(def)}
                  className="py-3 hover:bg-zinc-50 px-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <span className="font-semibold text-sm text-[#111111] block">
                      {item.scaleName}
                    </span>
                    <span className="text-xs text-zinc-500 block line-clamp-1">
                      {def?.description}
                    </span>
                  </div>
                  <span className="text-base font-mono-nums font-bold text-[#E50056] shrink-0">
                    {item.activeScore.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Verschil tussen leerlingen en student-docenten (HAN) */}
      {currentMode === 'student' && largestGapsWithHan.length > 0 && (
        <div className="mt-6 pt-5 border-t border-zinc-200">
          <div className="flex items-center gap-2 font-bold text-sm text-[#111111] mb-3">
            <ArrowRight className="w-4 h-4 text-[#E50056]" />
            Grootste verschil tussen klas en groep "HAN"
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {largestGapsWithHan.map((item) => (
              <div key={item.scaleId} className="bg-zinc-50 p-3.5 rounded-lg border border-zinc-200 text-xs">
                <span className="font-bold text-[#111111] block">{item.scaleName}</span>
                <p className="text-zinc-600 mt-1 font-mono-nums">
                  Klas: <strong className="text-[#E50056]">{(item.ownScore ?? 0).toFixed(2)}</strong> &middot; Docenten (HAN): <strong className="text-[#111111]">{item.hanScore.toFixed(2)}</strong> &middot; Verschil: <strong className="text-[#111111]">{(item.deltaWithHan ?? 0) > 0 ? `+${(item.deltaWithHan ?? 0).toFixed(2)}` : (item.deltaWithHan ?? 0).toFixed(2)}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
