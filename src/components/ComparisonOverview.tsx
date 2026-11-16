import React, { useState } from 'react';
import { 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  ChevronRight
} from 'lucide-react';
import { ScaleDefinition, ComparisonItem } from '../types/survey';

interface ComparisonOverviewProps {
  comparisonData: ComparisonItem[];
  scales: ScaleDefinition[];
  currentMode: 'total' | 'han' | 'student';
  selectedStudentNumber: string;
  showBenchmark: boolean;
  onSelectScale: (scale: ScaleDefinition) => void;
}

export const ComparisonOverview: React.FC<ComparisonOverviewProps> = ({
  comparisonData,
  scales,
  currentMode,
  selectedStudentNumber,
  showBenchmark,
  onSelectScale,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Alle 15 Schalen' },
    { id: 'voorbereiding', label: '1. Voorbereiding' },
    { id: 'uitvoering', label: '2. Uitvoering' },
    { id: 'reflectie', label: '3. Reflectie' },
    { id: 'motivatie', label: '4. Motivatie (ZDT)' },
    { id: 'zelfeffectiviteit', label: '5. Zelfeffectiviteit' },
  ];

  const filteredComparison = activeCategory === 'all'
    ? comparisonData
    : comparisonData.filter((item) => item.category === activeCategory);

  const getPercentage = (score: number) => {
    return Math.max(0, Math.min(100, ((score - 1) / 4) * 100));
  };

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 sm:p-6 mb-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-[#E50056]" />
            <h2 className="text-xl font-bold text-[#111111]">
              Analyseresultaten per Schaal (1 t/m 5)
            </h2>
          </div>
          <p className="text-xs text-zinc-500">
            {currentMode === 'student'
              ? `Scores voor studentnummer ${selectedStudentNumber}${showBenchmark ? ' vergeleken met totaal leerlingen en groep HAN' : ''}`
              : currentMode === 'han'
              ? 'Scores van groep "HAN" (Lerarenopleiding studenten)'
              : 'Gemiddelde score over alle deelnemende middelbare schoolleerlingen'}
          </p>
        </div>

        {/* Categorie tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#111111] text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legenda (unboxed met kleurblokjes) */}
      {showBenchmark && (
        <div className="mt-4 py-2.5 px-3 bg-zinc-50 rounded-lg border border-zinc-200 flex flex-wrap items-center gap-5 text-xs font-medium text-zinc-700">
          <span className="text-zinc-500 font-semibold">Legenda:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#E50056]"></span>
            <span>{currentMode === 'student' ? `Eigen Klas (${selectedStudentNumber})` : 'Eigen Klas'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-zinc-500"></span>
            <span>Totaal alle leerlingen</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#111111]"></span>
            <span>Groep "HAN" (Docenten)</span>
          </div>
        </div>
      )}

      {/* Schalen Lijst */}
      <div className="mt-6 divide-y divide-zinc-200 border-t border-b border-zinc-200">
        {filteredComparison.map((item, idx) => {
          const scaleDef = scales.find((s) => s.id === item.scaleId) || scales[0];
          const activeScore = currentMode === 'student' 
            ? item.ownScore ?? 0 
            : currentMode === 'han' 
            ? item.hanScore 
            : item.totalScore;

          return (
            <div
              key={item.scaleId}
              onClick={() => onSelectScale(scaleDef)}
              className="group py-4 px-2 sm:px-3 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-mono-nums text-xs font-bold text-[#E50056]">
                    {String(idx + 1).padStart(2, '0')}.
                  </span>
                  <h3 className="font-bold text-[#111111] group-hover:text-[#E50056] transition-colors text-base">
                    {item.scaleName}
                  </h3>
                  <span className="text-xs text-zinc-400 hidden sm:inline">
                    &middot; {scaleDef.categoryName.split(' ')[0]}
                  </span>
                </div>

                {/* Score en delta */}
                <div className="flex items-center gap-4">
                  <div className="text-right font-mono-nums">
                    <span className="text-lg font-bold text-[#111111]">
                      {activeScore.toFixed(2)}
                    </span>
                    <span className="text-xs text-zinc-400"> / 5.00</span>
                  </div>

                  {currentMode === 'student' && item.deltaWithTotal !== null && (
                    <div
                      className={`inline-flex items-center gap-0.5 text-xs font-mono-nums font-bold px-2 py-0.5 rounded-md ${
                        item.deltaWithTotal > 0.1
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.deltaWithTotal < -0.1
                          ? 'bg-rose-50 text-[#E50056]'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                      title="Verschil met het gemiddelde van alle leerlingen"
                    >
                      {item.deltaWithTotal > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : item.deltaWithTotal < 0 ? (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                      <span>{item.deltaWithTotal > 0 ? `+${item.deltaWithTotal.toFixed(2)}` : item.deltaWithTotal.toFixed(2)}</span>
                    </div>
                  )}

                  <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[#E50056] transition-colors" />
                </div>
              </div>

              <p className="text-xs text-zinc-500 mb-3 line-clamp-1">
                {scaleDef.description}
              </p>

              {/* Voortgangsbalk */}
              <div className="space-y-2">
                <div className="w-full bg-zinc-100 h-2.5 rounded-sm overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentMode === 'student'
                        ? 'bg-[#E50056]'
                        : currentMode === 'han'
                        ? 'bg-[#111111]'
                        : 'bg-zinc-700'
                    }`}
                    style={{ width: `${getPercentage(activeScore)}%` }}
                  />
                </div>

                {showBenchmark && currentMode === 'student' && (
                  <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-500 pt-0.5 font-mono-nums">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-xs bg-zinc-500"></span>
                      Totaal leerlingen: <strong className="text-[#111111]">{item.totalScore.toFixed(2)}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-xs bg-[#111111]"></span>
                      Groep "HAN": <strong className="text-[#111111]">{item.hanScore.toFixed(2)}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
