import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  ListOrdered, 
  Compass, 
  Table, 
  Download, 
  Info
} from 'lucide-react';
import { ALL_QUESTIONS, SCALE_DEFINITIONS } from './data/surveyDefinitions';
import { RespondentRecord, ScaleDefinition } from './types/survey';
import { generateRealisticSampleDataset } from './utils/sampleDataGenerator';
import { 
  calculateGroupStats, 
  buildComparisonList 
} from './utils/statistics';
import { exportSummaryToExcel } from './utils/excelParser';
import { Header } from './components/Header';
import { GroupFilterBar, FilterMode } from './components/GroupFilterBar';
import { ComparisonOverview } from './components/ComparisonOverview';
import { QuestionsExplorer } from './components/QuestionsExplorer';
import { ScaleDetailModal } from './components/ScaleDetailModal';
import { ExcelUploadModal } from './components/ExcelUploadModal';
import { PedagogicalInsights } from './components/PedagogicalInsights';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  // Dataset state
  const [records, setRecords] = useState<RespondentRecord[]>(() => {
    const saved = localStorage.getItem('zr_custom_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return generateRealisticSampleDataset();
  });

  const [isCustomData, setIsCustomData] = useState<boolean>(() => {
    return localStorage.getItem('zr_is_custom') === 'true';
  });

  const [customFileName, setCustomFileName] = useState<string>(() => {
    return localStorage.getItem('zr_filename') || '';
  });

  // Filter state
  const [filterMode, setFilterMode] = useState<FilterMode>('student');
  const [selectedStudentNumber, setSelectedStudentNumber] = useState<string>('');
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);

  // Tab navigation state
  const [activeMainTab, setActiveMainTab] = useState<'schalen' | 'vragen' | 'advies' | 'data'>('schalen');
  const [questionsScaleFilter, setQuestionsScaleFilter] = useState<string>('all');

  // Modals state
  const [selectedScale, setSelectedScale] = useState<ScaleDefinition | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);

  // Extract distinct student numbers (all groups except "HAN")
  const studentNumbers = useMemo(() => {
    const nums = new Set<string>();
    records.forEach((r) => {
      if (r.group.toUpperCase() !== 'HAN') {
        nums.add(r.group);
      }
    });
    return Array.from(nums).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [records]);

  useEffect(() => {
    if (!selectedStudentNumber && studentNumbers.length > 0) {
      setSelectedStudentNumber(studentNumbers[0]);
    }
  }, [studentNumbers, selectedStudentNumber]);

  const hanRecords = useMemo(() => {
    return records.filter((r) => r.group.toUpperCase() === 'HAN');
  }, [records]);

  const allPupilRecords = useMemo(() => {
    return records.filter((r) => r.group.toUpperCase() !== 'HAN');
  }, [records]);

  const ownGroupRecords = useMemo(() => {
    return records.filter((r) => r.group === selectedStudentNumber);
  }, [records, selectedStudentNumber]);

  const totalStats = useMemo(() => {
    return calculateGroupStats(
      allPupilRecords,
      'Totaal Leerlingen',
      'Totaal alle leerlingen',
      SCALE_DEFINITIONS
    );
  }, [allPupilRecords]);

  const hanStats = useMemo(() => {
    return calculateGroupStats(
      hanRecords,
      'HAN',
      'Groep "HAN" (Docenten in opleiding)',
      SCALE_DEFINITIONS
    );
  }, [hanRecords]);

  const ownGroupStats = useMemo(() => {
    if (!selectedStudentNumber) return null;
    return calculateGroupStats(
      ownGroupRecords,
      selectedStudentNumber,
      `Klas (${selectedStudentNumber})`,
      SCALE_DEFINITIONS
    );
  }, [ownGroupRecords, selectedStudentNumber]);

  const activeStats = useMemo(() => {
    if (filterMode === 'han') return hanStats;
    if (filterMode === 'student') return ownGroupStats || totalStats;
    return totalStats;
  }, [filterMode, hanStats, ownGroupStats, totalStats]);

  const comparisonData = useMemo(() => {
    return buildComparisonList(ownGroupStats, totalStats, hanStats, SCALE_DEFINITIONS);
  }, [ownGroupStats, totalStats, hanStats]);

  const selectedComparisonItem = useMemo(() => {
    if (!selectedScale) return null;
    return comparisonData.find((item) => item.scaleId === selectedScale.id) || null;
  }, [selectedScale, comparisonData]);

  const handleDataLoaded = (newRecords: RespondentRecord[], fileName: string) => {
    setRecords(newRecords);
    setIsCustomData(true);
    setCustomFileName(fileName);
    localStorage.setItem('zr_custom_records', JSON.stringify(newRecords));
    localStorage.setItem('zr_is_custom', 'true');
    localStorage.setItem('zr_filename', fileName);

    const newStudentNums = Array.from(
      new Set(newRecords.filter((r) => r.group.toUpperCase() !== 'HAN').map((r) => r.group))
    );
    if (newStudentNums.length > 0) {
      setSelectedStudentNumber(newStudentNums[0]);
    }
  };

  const handleResetToSample = () => {
    const sample = generateRealisticSampleDataset();
    setRecords(sample);
    setIsCustomData(false);
    setCustomFileName('');
    localStorage.removeItem('zr_custom_records');
    localStorage.removeItem('zr_is_custom');
    localStorage.removeItem('zr_filename');
    setSelectedStudentNumber('304918');
  };

  const handleExportExcel = () => {
    const currentName = filterMode === 'student' ? `Student_${selectedStudentNumber}` : filterMode === 'han' ? 'HAN' : 'Totaal';
    const questionRows = ALL_QUESTIONS.map((q) => ({
      number: q.number,
      scale: q.scale,
      text: q.text,
      ownScore: ownGroupStats ? (ownGroupStats.questionAverages[q.number] ?? null) : null,
      totalScore: totalStats.questionAverages[q.number] ?? 0,
      hanScore: hanStats.questionAverages[q.number] ?? 0,
      stdDev: activeStats.questionStdDevs[q.number] ?? 0,
    }));
    exportSummaryToExcel(comparisonData, currentName, questionRows);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F6F6F7] text-[#111111] antialiased selection:bg-[#E50056]/15 selection:text-[#E50056] pb-16">
      {/* App Header */}
      <Header
        isCustomData={isCustomData}
        fileName={customFileName}
        totalRespondents={records.length}
        onOpenUpload={() => setUploadModalOpen(true)}
        onResetToSample={handleResetToSample}
        onExportExcel={handleExportExcel}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* HAN Hero Banner (Zwart/Wit/Rood) */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111111] text-white p-6 sm:p-7 rounded-xl">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-2">
              <span className="font-bold text-[#E50056]">HAN Lerarenopleiding</span>
              <span aria-hidden="true">&middot;</span>
              <span>Vragenlijst Zelfregulerend Leren</span>
              <span aria-hidden="true">&middot;</span>
              <span className="font-mono-nums text-zinc-300">N = {records.length} respondenten</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white [text-wrap:balance]">
              Analyse &amp; Vergelijking Zelfregulatietool
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 max-w-2xl leading-relaxed">
              Analyseer alle 15 schalen en 75 afzonderlijke stellingen. Sorteer op jouw studentnummer, bekijk het totaal van alle leerlingen of vergelijk met groep "HAN".
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-[#E50056] hover:bg-[#C20048] text-white font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Eigen Excel Inlezen
            </button>
            {isCustomData && (
              <button
                onClick={handleResetToSample}
                className="md:hidden px-3.5 py-2.5 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 font-semibold text-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Terug naar voorbeeld
              </button>
            )}
          </div>
        </div>

        {/* Filter balk (Eigen groep / Totaal / HAN) */}
        <GroupFilterBar
          mode={filterMode}
          selectedStudentNumber={selectedStudentNumber}
          studentNumbers={studentNumbers}
          totalCount={allPupilRecords.length}
          hanCount={hanRecords.length}
          ownCount={ownGroupRecords.length}
          showBenchmark={showBenchmark}
          onModeChange={setFilterMode}
          onStudentNumberChange={setSelectedStudentNumber}
          onToggleBenchmark={setShowBenchmark}
        />

        {/* Tab navigatie (HAN underline/segmented stijl) */}
        <div className="flex items-center gap-2 border-b border-zinc-200 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveMainTab('schalen')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeMainTab === 'schalen'
                ? 'border-[#E50056] text-[#E50056]'
                : 'border-transparent text-zinc-600 hover:text-[#111111]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>15 Schalen Analyse</span>
          </button>

          <button
            onClick={() => setActiveMainTab('vragen')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeMainTab === 'vragen'
                ? 'border-[#E50056] text-[#E50056]'
                : 'border-transparent text-zinc-600 hover:text-[#111111]'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>75 Vragen Detailverkenner</span>
          </button>

          <button
            onClick={() => setActiveMainTab('advies')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeMainTab === 'advies'
                ? 'border-[#E50056] text-[#E50056]'
                : 'border-transparent text-zinc-600 hover:text-[#111111]'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Pedagogische Inzichten</span>
          </button>

          <button
            onClick={() => setActiveMainTab('data')}
            className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeMainTab === 'data'
                ? 'border-[#E50056] text-[#E50056]'
                : 'border-transparent text-zinc-600 hover:text-[#111111]'
            }`}
          >
            <Table className="w-4 h-4" />
            <span className="font-mono-nums">Respondenten ({records.length})</span>
          </button>
        </div>

        {/* Tab 1: Schalenanalyse */}
        {activeMainTab === 'schalen' && (
          <div>
            <ComparisonOverview
              comparisonData={comparisonData}
              scales={SCALE_DEFINITIONS}
              currentMode={filterMode}
              selectedStudentNumber={selectedStudentNumber}
              showBenchmark={showBenchmark}
              onSelectScale={(scale) => setSelectedScale(scale)}
            />

            <PedagogicalInsights
              comparisonData={comparisonData}
              scales={SCALE_DEFINITIONS}
              currentMode={filterMode}
              selectedStudentNumber={selectedStudentNumber}
              onSelectScale={(scale) => setSelectedScale(scale)}
            />
          </div>
        )}

        {/* Tab 2: Vragenlijst 75 Items */}
        {activeMainTab === 'vragen' && (
          <QuestionsExplorer
            questions={ALL_QUESTIONS}
            scales={SCALE_DEFINITIONS}
            questionAverages={activeStats.questionAverages}
            questionStdDevs={activeStats.questionStdDevs}
            questionDistributions={activeStats.questionDistributions}
            totalQuestionAverages={totalStats.questionAverages}
            hanQuestionAverages={hanStats.questionAverages}
            currentMode={filterMode}
            selectedStudentNumber={selectedStudentNumber}
            showBenchmark={showBenchmark}
            initialScaleFilter={questionsScaleFilter}
            currentGroupName={
              filterMode === 'student'
                ? `klas (${selectedStudentNumber})`
                : filterMode === 'han'
                ? 'groep "HAN"'
                : 'het totaal van alle leerlingen'
            }
          />
        )}

        {/* Tab 3: Pedagogische Adviezen */}
        {activeMainTab === 'advies' && (
          <PedagogicalInsights
            comparisonData={comparisonData}
            scales={SCALE_DEFINITIONS}
            currentMode={filterMode}
            selectedStudentNumber={selectedStudentNumber}
            onSelectScale={(scale) => setSelectedScale(scale)}
          />
        )}

        {/* Tab 4: Ruwe Data & Respondentenlijst */}
        {activeMainTab === 'data' && (
          <div className="bg-white rounded-xl border border-zinc-200 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#111111]">
                  Respondentenoverzicht
                </h3>
                <p className="text-xs text-zinc-500">
                  Alle ingelezen rijen uit het Invoerblad van het Excel-bestand
                </p>
              </div>
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#111111] border border-zinc-300 hover:border-[#111111] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Exporteer Excel
              </button>
            </div>

            <div className="mb-4 p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#E50056] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#111111]">Anonimiteit &amp; Groepsniveau:</strong> Studenten die met de code <strong className="text-[#E50056]">"HAN"</strong> hebben ingelogd zijn anoniem samengevoegd tot één docentengroep. Individuele studenten zijn hierdoor niet te herleiden; de tool is bedoeld voor analyse op klas- en groepsniveau.
              </span>
            </div>

            <div className="overflow-x-auto max-h-[550px] border border-zinc-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#111111] text-white font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Klas / Groep</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Vak</th>
                    <th className="p-3 text-right">Ingevulde Vragen</th>
                    <th className="p-3 text-right">Gemiddelde Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {records.map((r, idx) => {
                    const answeredCount = Object.keys(r.answers).length;
                    const vals = Object.values(r.answers);
                    const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '-';
                    const isHan = r.group.toUpperCase() === 'HAN';

                    return (
                      <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                        <td className="p-3 text-zinc-500 font-mono-nums">{r.id || idx + 1}</td>
                        <td className="p-3 font-semibold text-[#111111] font-mono-nums">
                          {r.group}
                        </td>
                        <td className="p-3">
                          <span className={isHan ? 'font-bold text-[#E50056]' : 'font-medium text-zinc-700'}>
                            {isHan ? 'Docent (HAN)' : 'Leerling'}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-600">{r.subject || 'Algemeen'}</td>
                        <td className="p-3 text-zinc-600 text-right font-mono-nums">{answeredCount} / 75</td>
                        <td className="p-3 font-bold text-[#111111] text-right font-mono-nums">{avg}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal voor een specifieke schaal */}
      <ScaleDetailModal
        scale={selectedScale}
        comparisonItem={selectedComparisonItem}
        questions={ALL_QUESTIONS}
        questionAverages={activeStats.questionAverages}
        questionStdDevs={activeStats.questionStdDevs}
        totalQuestionAverages={totalStats.questionAverages}
        hanQuestionAverages={hanStats.questionAverages}
        currentMode={filterMode}
        selectedStudentNumber={selectedStudentNumber}
        onClose={() => setSelectedScale(null)}
        onOpenInQuestionsTab={(scaleName) => {
          setQuestionsScaleFilter(scaleName);
          setActiveMainTab('vragen');
        }}
      />

      {/* Excel Upload Modal */}
      <ExcelUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
