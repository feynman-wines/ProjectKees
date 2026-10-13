import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb, 
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
  // Determine relevant scores based on current mode
  const scoredItems = comparisonData.map((item) => {
    const score = currentMode === 'student'
      ? item.ownScore ?? 0
      : currentMode === 'han'
      ? item.hanScore
      : item.totalScore;
    return { ...item, activeScore: score };
  });

  // Sort by score
  const sortedByScore = [...scoredItems].sort((a, b) => b.activeScore - a.activeScore);
  const topStrengths = sortedByScore.slice(0, 3);
  const topGrowthAreas = sortedByScore.slice(-3).reverse();

  // Find scale with largest gap compared to HAN (if in student view)
  const largestGapsWithHan = [...scoredItems]
    .filter((item) => item.deltaWithHan !== null)
    .sort((a, b) => Math.abs(b.deltaWithHan || 0) - Math.abs(a.deltaWithHan || 0))
    .slice(0, 2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Compass className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-900">
          Pedagogische Analyse & Lesadviezen
        </h2>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Automatisch gegenereerde didactische inzichten voor {currentMode === 'student' ? `klas ${selectedStudentNumber}` : currentMode === 'han' ? 'groep HAN' : 'het totaal van alle leerlingen'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sterke punten */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Sterke punten (Hoogste scores)
          </div>
          <div className="space-y-3">
            {topStrengths.map((item) => {
              const def = scales.find((s) => s.id === item.scaleId);
              return (
                <div
                  key={item.scaleId}
                  onClick={() => def && onSelectScale(def)}
                  className="p-3 bg-white rounded-xl border border-emerald-100 hover:border-emerald-300 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-xs text-slate-900 block">
                      {item.scaleName}
                    </span>
                    <span className="text-[11px] text-slate-500 block line-clamp-1">
                      {def?.description}
                    </span>
                  </div>
                  <span className="text-base font-extrabold text-emerald-700 shrink-0 ml-3">
                    {item.activeScore.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ontwikkelkansen / Aandachtspunten */}
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Ontwikkelkansen (Laagste scores)
          </div>
          <div className="space-y-3">
            {topGrowthAreas.map((item) => {
              const def = scales.find((s) => s.id === item.scaleId);
              return (
                <div
                  key={item.scaleId}
                  onClick={() => def && onSelectScale(def)}
                  className="p-3 bg-white rounded-xl border border-amber-100 hover:border-amber-300 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-xs text-slate-900 block">
                      {item.scaleName}
                    </span>
                    <span className="text-[11px] text-slate-500 block line-clamp-1">
                      {def?.description}
                    </span>
                  </div>
                  <span className="text-base font-extrabold text-amber-700 shrink-0 ml-3">
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
        <div className="mt-5 p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs">
          <div className="flex items-center gap-2 font-bold text-blue-950 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Grootste waargenomen verschil tussen klas en groep "HAN":
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {largestGapsWithHan.map((item) => (
              <div key={item.scaleId} className="bg-white p-3 rounded-xl border border-blue-100">
                <span className="font-semibold text-slate-900 block">{item.scaleName}</span>
                <p className="text-[11px] text-slate-600 mt-1">
                  Klas scoort <strong>{(item.ownScore ?? 0).toFixed(2)}</strong> vs. docenten <strong>{item.hanScore.toFixed(2)}</strong>{' '}
                  (verschil: <strong>{(item.deltaWithHan ?? 0) > 0 ? `+${(item.deltaWithHan ?? 0).toFixed(2)}` : (item.deltaWithHan ?? 0).toFixed(2)}</strong>).
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
