import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ListOrdered,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { QuestionItem, ScaleDefinition } from '../types/survey';

interface QuestionsExplorerProps {
  questions: QuestionItem[];
  scales: ScaleDefinition[];
  questionAverages: Record<number, number>;
  questionStdDevs: Record<number, number>;
  questionDistributions: Record<number, { 1: number; 2: number; 3: number; 4: number; 5: number }>;
  totalQuestionAverages: Record<number, number>;
  hanQuestionAverages: Record<number, number>;
  currentMode: 'total' | 'han' | 'student';
  selectedStudentNumber: string;
  showBenchmark: boolean;
  currentGroupName: string;
  initialScaleFilter?: string;
}

function getQuestionStem(qNum: number): string | null {
  if (qNum >= 49 && qNum <= 62) {
    return 'Ik doe mijn best voor school…';
  }
  if (qNum >= 63 && qNum <= 75) {
    return 'Ik ben goed in…';
  }
  return null;
}

export const QuestionsExplorer: React.FC<QuestionsExplorerProps> = ({
  questions,
  scales,
  questionAverages,
  questionStdDevs,
  questionDistributions,
  totalQuestionAverages,
  hanQuestionAverages,
  currentMode,
  selectedStudentNumber,
  showBenchmark,
  currentGroupName,
  initialScaleFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScale, setSelectedScale] = useState<string>(initialScaleFilter || 'all');
  const [sortBy, setSortBy] = useState<'number' | 'asc_score' | 'desc_score' | 'std'>('number');

  useEffect(() => {
    if (initialScaleFilter) {
      setSelectedScale(initialScaleFilter);
    }
  }, [initialScaleFilter]);

  const filteredQuestions = questions.filter((q) => {
    const stem = getQuestionStem(q.number) || '';
    const matchesSearch =
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.scale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(q.number).includes(searchTerm.trim());
    const matchesScale = selectedScale === 'all' || q.scale === selectedScale;
    return matchesSearch && matchesScale;
  });

  const sortedQuestions = [...filteredQuestions].sort((a, b) => {
    const scoreA = questionAverages[a.number] || 0;
    const scoreB = questionAverages[b.number] || 0;
    const stdA = questionStdDevs[a.number] || 0;
    const stdB = questionStdDevs[b.number] || 0;

    if (sortBy === 'asc_score') return scoreA - scoreB;
    if (sortBy === 'desc_score') return scoreB - scoreA;
    if (sortBy === 'std') return stdB - stdA;
    return a.number - b.number;
  });

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 sm:p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ListOrdered className="w-5 h-5 text-[#E50056]" />
            <h2 className="text-xl font-bold text-[#111111]">
              Resultaten per Vraag &amp; Stelling (75 Items)
            </h2>
          </div>
          <p className="text-xs text-zinc-500">
            Bekijk afzonderlijke scores, antwoordverdelingen en benchmarks voor {currentGroupName}
          </p>
        </div>

        {/* Filters & Zoeken */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Zoek op vraagtekst of nr..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:border-[#E50056]"
            />
          </div>

          <select
            value={selectedScale}
            onChange={(e) => setSelectedScale(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-[#111111] focus:outline-none focus:border-[#E50056] cursor-pointer"
          >
            <option value="all">Alle Schalen ({scales.length})</option>
            {scales.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'number' | 'asc_score' | 'desc_score' | 'std')}
            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-[#111111] focus:outline-none focus:border-[#E50056] cursor-pointer"
          >
            <option value="number">Vraagnummer (1-75)</option>
            <option value="asc_score">Laagste score eerst (Aandachtspunt)</option>
            <option value="desc_score">Hoogste score eerst (Kracht)</option>
            <option value="std">Grootste spreiding (Verdeeldheid)</option>
          </select>
        </div>
      </div>

      {/* Legenda van de Likert-schaal */}
      <div className="mt-4 py-2.5 px-3 bg-zinc-50 rounded-lg border border-zinc-200 flex flex-wrap items-center justify-between text-[11px] text-zinc-600 gap-2">
        <span className="font-semibold text-[#111111]">Antwoordschaal (1 t/m 5):</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-[#E50056]"></span> 1: Nooit / Helemaal oneens</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-rose-300"></span> 2: Bijna nooit / Oneens</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-zinc-300"></span> 3: Soms / Neutraal</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-zinc-600"></span> 4: Bijna altijd / Akkoord</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-[#111111]"></span> 5: Altijd / Helemaal akkoord</span>
        </div>
      </div>

      {/* Teller */}
      <div className="mt-3 text-xs text-zinc-500 font-medium">
        Toont <strong className="text-[#111111] font-mono-nums">{sortedQuestions.length}</strong> van de {questions.length} stellingen
        {selectedScale !== 'all' && (
          <button
            onClick={() => setSelectedScale('all')}
            className="ml-2 text-[#E50056] font-semibold hover:underline cursor-pointer"
          >
            Toon alle schalen
          </button>
        )}
      </div>

      {/* Vragenlijst */}
      <div className="mt-4 divide-y divide-zinc-200 border-t border-b border-zinc-200">
        {sortedQuestions.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-400">
            Geen vragen gevonden met de huidige filters.
          </div>
        ) : (
          sortedQuestions.map((q) => {
            const avg = questionAverages[q.number] ?? 0;
            const std = questionStdDevs[q.number] ?? 0;
            const totalAvg = totalQuestionAverages[q.number] ?? 0;
            const hanAvg = hanQuestionAverages[q.number] ?? 0;
            const deltaTotal = Number((avg - totalAvg).toFixed(2));
            const dist = questionDistributions[q.number] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            const totalResponses = dist[1] + dist[2] + dist[3] + dist[4] + dist[5];
            const denom = totalResponses || 1;
            const stem = getQuestionStem(q.number);

            return (
              <div
                key={q.number}
                className="py-4 px-2 sm:px-3 hover:bg-zinc-50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#111111] text-white font-mono-nums font-bold text-xs flex items-center justify-center shrink-0">
                      {q.number}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mb-0.5">
                        <span className="font-semibold text-[#E50056]">
                          {q.scale}
                        </span>
                        {stem && (
                          <>
                            <span aria-hidden="true">&middot;</span>
                            <span className="italic text-zinc-500">{stem}</span>
                          </>
                        )}
                      </div>
                      <p className="text-sm font-medium text-[#111111] leading-relaxed">
                        {q.text}
                      </p>
                    </div>
                  </div>

                  {/* Gemiddelde, delta & std dev */}
                  <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-zinc-100">
                    {currentMode === 'student' && (
                      <div
                        className={`inline-flex items-center gap-0.5 text-xs font-mono-nums font-bold px-2 py-0.5 rounded-md ${
                          deltaTotal > 0.1
                            ? 'bg-emerald-50 text-emerald-700'
                            : deltaTotal < -0.1
                            ? 'bg-rose-50 text-[#E50056]'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                        title="Verschil met het gemiddelde van alle leerlingen"
                      >
                        {deltaTotal > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : deltaTotal < 0 ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <Minus className="w-3.5 h-3.5" />
                        )}
                        <span>{deltaTotal > 0 ? `+${deltaTotal.toFixed(2)}` : deltaTotal.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="text-right font-mono-nums">
                      <span className="text-base font-bold text-[#111111]">
                        {avg.toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-400"> / 5.0</span>
                      <span className="block text-[10px] text-zinc-400">Gemiddelde</span>
                    </div>
                    <div className="text-right font-mono-nums">
                      <span className="text-xs font-semibold text-zinc-600">
                        &plusmn; {std.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-zinc-400">Spreiding</span>
                    </div>
                  </div>
                </div>

                {/* Benchmark vergelijking per vraag */}
                {showBenchmark && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-zinc-500 font-mono-nums">
                    {currentMode === 'student' && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-xs bg-[#E50056]"></span>
                        Klas ({selectedStudentNumber}): <strong className="text-[#111111]">{avg.toFixed(2)}</strong>
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-xs bg-zinc-500"></span>
                      Totaal leerlingen: <strong className="text-[#111111]">{totalAvg.toFixed(2)}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-xs bg-[#111111]"></span>
                      Groep "HAN": <strong className="text-[#111111]">{hanAvg.toFixed(2)}</strong>
                    </span>
                  </div>
                )}

                {/* Likert verdelingsbalk */}
                <div className="mt-3">
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 mb-1.5 gap-2 font-mono-nums">
                    <span>Antwoordverdeling (N = {totalResponses})</span>
                    <div className="flex items-center gap-3">
                      <span>1: <strong className="text-[#111111]">{dist[1]}</strong></span>
                      <span>2: <strong className="text-[#111111]">{dist[2]}</strong></span>
                      <span>3: <strong className="text-[#111111]">{dist[3]}</strong></span>
                      <span>4: <strong className="text-[#111111]">{dist[4]}</strong></span>
                      <span>5: <strong className="text-[#111111]">{dist[5]}</strong></span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-sm overflow-hidden flex bg-zinc-100">
                    <div
                      style={{ width: `${(dist[1] / denom) * 100}%` }}
                      className="bg-[#E50056] h-full"
                      title={`Score 1: ${dist[1]} respondenten`}
                    />
                    <div
                      style={{ width: `${(dist[2] / denom) * 100}%` }}
                      className="bg-rose-300 h-full"
                      title={`Score 2: ${dist[2]} respondenten`}
                    />
                    <div
                      style={{ width: `${(dist[3] / denom) * 100}%` }}
                      className="bg-zinc-300 h-full"
                      title={`Score 3: ${dist[3]} respondenten`}
                    />
                    <div
                      style={{ width: `${(dist[4] / denom) * 100}%` }}
                      className="bg-zinc-600 h-full"
                      title={`Score 4: ${dist[4]} respondenten`}
                    />
                    <div
                      style={{ width: `${(dist[5] / denom) * 100}%` }}
                      className="bg-[#111111] h-full"
                      title={`Score 5: ${dist[5]} respondenten`}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
