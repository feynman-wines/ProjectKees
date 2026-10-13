import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  ListOrdered
} from 'lucide-react';
import { QuestionItem, ScaleDefinition } from '../types/survey';

interface QuestionsExplorerProps {
  questions: QuestionItem[];
  scales: ScaleDefinition[];
  questionAverages: Record<number, number>;
  questionStdDevs: Record<number, number>;
  questionDistributions: Record<number, { 1: number; 2: number; 3: number; 4: number; 5: number }>;
  currentGroupName: string;
}

export const QuestionsExplorer: React.FC<QuestionsExplorerProps> = ({
  questions,
  scales,
  questionAverages,
  questionStdDevs,
  questionDistributions,
  currentGroupName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScale, setSelectedScale] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'number' | 'asc_score' | 'desc_score' | 'std'>('number');

  // Filter
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(q.number).includes(searchTerm);
    const matchesScale = selectedScale === 'all' || q.scale === selectedScale;
    return matchesSearch && matchesScale;
  });

  // Sort
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
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ListOrdered className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Vragenlijst Detailverkenner (75 Items)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Bekijk de afzonderlijke stellingen, scores en de verdeling van antwoorden voor {currentGroupName}
          </p>
        </div>

        {/* Filters & Zoeken */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Zoekbalk */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Zoek in stelling of nummer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Schaal selector */}
          <select
            value={selectedScale}
            onChange={(e) => setSelectedScale(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Alle Schalen ({scales.length})</option>
            {scales.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Sortering */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="number">Vraagnummer (1-75)</option>
            <option value="asc_score">Laagste score eerst (Aandachtspunt)</option>
            <option value="desc_score">Hoogste score eerst (Kracht)</option>
            <option value="std">Grootste spreiding (Verdeeldheid)</option>
          </select>
        </div>
      </div>

      {/* Legenda van de Likert-schaal */}
      <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
        <span className="font-semibold text-slate-700">Antwoordschaal (1 t/m 5):</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-rose-400"></span> 1: Nooit</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-amber-400"></span> 2: Bijna nooit</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-slate-400"></span> 3: Soms</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-blue-400"></span> 4: Bijna altijd</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> 5: Altijd</span>
        </div>
      </div>

      {/* Vragenlijst tabel / cards */}
      <div className="mt-5 space-y-3">
        {sortedQuestions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Geen vragen gevonden met de huidige filters.
          </div>
        ) : (
          sortedQuestions.map((q) => {
            const avg = questionAverages[q.number] || 0;
            const std = questionStdDevs[q.number] || 0;
            const dist = questionDistributions[q.number] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            const totalResponses = (dist[1] + dist[2] + dist[3] + dist[4] + dist[5]) || 1;

            return (
              <div
                key={q.number}
                className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {q.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {q.scale}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                        {q.text}
                      </p>
                    </div>
                  </div>

                  {/* Gemiddelde & std dev */}
                  <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-slate-900">
                        {avg.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400"> / 5.0</span>
                      <span className="block text-[10px] text-slate-400">Gemiddelde</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-600">
                        &plusmn; {std.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-slate-400">Spreiding</span>
                    </div>
                  </div>
                </div>

                {/* Likert verdelingsbalk */}
                <div className="mt-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Antwoordverdeling:</span>
                    <span>N = {totalResponses}</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100">
                    <div
                      style={{ width: `${(dist[1] / totalResponses) * 100}%` }}
                      className="bg-rose-400 h-full"
                      title={`1 (Nooit): ${dist[1]} respondenten`}
                    />
                    <div
                      style={{ width: `${(dist[2] / totalResponses) * 100}%` }}
                      className="bg-amber-400 h-full"
                      title={`2 (Bijna nooit): ${dist[2]} respondenten`}
                    />
                    <div
                      style={{ width: `${(dist[3] / totalResponses) * 100}%` }}
                      className="bg-slate-400 h-full"
                      title={`3 (Soms): ${dist[3]} respondenten`}
                    />
                    <div
                      style={{ width: `${(dist[4] / totalResponses) * 100}%` }}
                      className="bg-blue-400 h-full"
                      title={`4 (Bijna altijd): ${dist[4]} respondenten`}
                    />
                    <div
                      style={{ width: `${(dist[5] / totalResponses) * 100}%` }}
                      className="bg-emerald-500 h-full"
                      title={`5 (Altijd): ${dist[5]} respondenten`}
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
