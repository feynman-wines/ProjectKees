import React, { useState } from 'react';
import { 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus, 
  HelpCircle, 
  ChevronRight,
  TrendingUp,
  Layers,
  Sparkles
} from 'lucide-react';
import { ScaleDefinition, ComparisonItem, ScaleCategory } from '../types/survey';

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

  const categories: { id: string; label: string; count: number }[] = [
    { id: 'all', label: 'Alle 15 Schalen', count: 15 },
    { id: 'voorbereiding', label: '1. Voorbereiding', count: 2 },
    { id: 'uitvoering', label: '2. Uitvoering', count: 5 },
    { id: 'reflectie', label: '3. Reflectie', count: 2 },
    { id: 'motivatie', label: '4. Motivatie (ZDT)', count: 4 },
    { id: 'zelfeffectiviteit', label: '5. Zelfeffectiviteit', count: 2 },
  ];

  const filteredComparison = activeCategory === 'all'
    ? comparisonData
    : comparisonData.filter((item) => item.category === activeCategory);

  // Helper function to render a score bar (1.0 to 5.0)
  const getPercentage = (score: number) => {
    // 1.0 -> 0%, 5.0 -> 100%
    return Math.max(0, Math.min(100, ((score - 1) / 4) * 100));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Analyseresultaten per Schaal (1 t/m 5)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {currentMode === 'student'
              ? `Scores voor studentnummer ${selectedStudentNumber} ${showBenchmark ? 'vergeleken met totaal leerlingen en groep HAN' : ''}`
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legenda (wanneer benchmark aan staat) */}
      {showBenchmark && (
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
          <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Legenda:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-indigo-600"></span>
            <span>{currentMode === 'student' ? `Klas (${selectedStudentNumber})` : currentMode === 'han' ? 'Groep HAN' : 'Geselecteerde Groep'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-400"></span>
            <span>Totaal alle leerlingen (Benchmark)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
            <span>Groep "HAN" (Docenten)</span>
          </div>
        </div>
      )}

      {/* Schalen Lijst */}
      <div className="mt-6 space-y-4">
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
              className="group p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-700 transition">
                    {idx + 1}
                  </span>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition text-sm sm:text-base">
                    {item.scaleName}
                  </h3>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {scaleDef.categoryName.split(' ')[0]}
                  </span>
                </div>

                {/* Score en delta badges */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-900">
                      {activeScore.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 font-normal"> / 5.0</span>
                  </div>

                  {/* Delta met totaal indien student view */}
                  {currentMode === 'student' && item.deltaWithTotal !== null && (
                    <div
                      className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-md ${
                        item.deltaWithTotal > 0.1
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.deltaWithTotal < -0.1
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-600'
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

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Korte toelichting van de schaal */}
              <p className="text-xs text-slate-500 mb-3 line-clamp-1">
                {scaleDef.description}
              </p>

              {/* Staafdiagrammen / Progress bars */}
              <div className="space-y-2">
                {/* Primaire balk */}
                <div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        currentMode === 'student'
                          ? 'bg-indigo-600'
                          : currentMode === 'han'
                          ? 'bg-emerald-600'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${getPercentage(activeScore)}%` }}
                    />
                  </div>
                </div>

                {/* Benchmark balken indien aan */}
                {showBenchmark && currentMode === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        Totaal alle leerlingen:
                      </span>
                      <span className="font-semibold text-slate-700">{item.totalScore.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Groep "HAN" docenten:
                      </span>
                      <span className="font-semibold text-slate-700">{item.hanScore.toFixed(2)}</span>
                    </div>
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
