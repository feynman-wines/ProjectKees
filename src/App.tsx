import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  ListOrdered, 
  Compass, 
  Table, 
  FileSpreadsheet, 
  Download, 
  Info,
  Layers,
  Sparkles,
  School
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

  // Set default student number if not set
  useEffect(() => {
    if (!selectedStudentNumber && studentNumbers.length > 0) {
      setSelectedStudentNumber(studentNumbers[0]);
    }
  }, [studentNumbers, selectedStudentNumber]);

  // Partition records
  const hanRecords = useMemo(() => {
    return records.filter((r) => r.group.toUpperCase() === 'HAN');
  }, [records]);

  const allPupilRecords = useMemo(() => {
    return records.filter((r) => r.group.toUpperCase() !== 'HAN');
  }, [records]);

  const ownGroupRecords = useMemo(() => {
    return records.filter((r) => r.group === selectedStudentNumber);
  }, [records, selectedStudentNumber]);

  // Compute Statistics
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

  // Active statistics according to current selected mode
  const activeStats = useMemo(() => {
    if (filterMode === 'han') return hanStats;
    if (filterMode === 'student') return ownGroupStats || totalStats;
    return totalStats;
  }, [filterMode, hanStats, ownGroupStats, totalStats]);

  // Comparison benchmark list
  const comparisonData = useMemo(() => {
    return buildComparisonList(ownGroupStats, totalStats, hanStats, SCALE_DEFINITIONS);
  }, [ownGroupStats, totalStats, hanStats]);

  // Selected comparison item for modal
  const selectedComparisonItem = useMemo(() => {
    if (!selectedScale) return null;
    return comparisonData.find((item) => item.scaleId === selectedScale.id) || null;
  }, [selectedScale, comparisonData]);

  // Handlers
  const handleDataLoaded = (newRecords: RespondentRecord[], fileName: string) => {
    setRecords(newRecords);
    setIsCustomData(true);
    setCustomFileName(fileName);
    localStorage.setItem('zr_custom_records', JSON.stringify(newRecords));
    localStorage.setItem('zr_is_custom', 'true');
    localStorage.setItem('zr_filename', fileName);

    // Auto select first student number
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
    exportSummaryToExcel(comparisonData, currentName);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 pb-16">
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
        {/* Intro banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 sm:p-6 rounded-2xl shadow-sm">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-[11px] font-semibold text-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Zelfregulerend Leren Analyseplatform
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Analyse & Vergelijking Vragenlijst
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl">
              Analyseer de 15 schalen en 75 stellingen. Sorteer op jouw eigen studentnummer, bekijk de landelijke benchmark of vergelijk direct met de docentgroep (HAN).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-950 font-bold text-xs hover:bg-blue-50 transition shadow-sm cursor-pointer"
            >
              Eigen Excel Inlezen
            </button>
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

        {/* Tab navigatie */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveMainTab('schalen')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              activeMainTab === 'schalen'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>15 Schalen Analyse</span>
          </button>

          <button
            onClick={() => setActiveMainTab('vragen')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              activeMainTab === 'vragen'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>75 Vragen Detailverkenner</span>
          </button>

          <button
            onClick={() => setActiveMainTab('advies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              activeMainTab === 'advies'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Pedagogische Inzichten</span>
          </button>

          <button
            onClick={() => setActiveMainTab('data')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
              activeMainTab === 'data'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Respondenten ({records.length})</span>
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

            {/* Inzichten samenvatting onderaan schalen */}
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
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Respondentenoverzicht
                </h3>
                <p className="text-xs text-slate-500">
                  Alle ingelezen rijen uit het Invoerblad van het Excel-bestand
                </p>
              </div>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                Exporteer Excel
              </button>
            </div>

            <div className="overflow-x-auto max-h-[550px] border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="p-3 border-b border-slate-200">#</th>
                    <th className="p-3 border-b border-slate-200">Klas / Groep</th>
                    <th className="p-3 border-b border-slate-200">Type</th>
                    <th className="p-3 border-b border-slate-200">Vak</th>
                    <th className="p-3 border-b border-slate-200">Ingevulde Vragen</th>
                    <th className="p-3 border-b border-slate-200">Gemiddelde Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r, idx) => {
                    const answeredCount = Object.keys(r.answers).length;
                    const vals = Object.values(r.answers);
                    const avg = vals.length > 0 ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : '-';
                    const isHan = r.group.toUpperCase() === 'HAN';

                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 text-slate-500">{r.id || idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-900">
                          {r.group}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isHan
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {isHan ? 'Docent (HAN)' : 'Leerling'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{r.subject || 'Algemeen'}</td>
                        <td className="p-3 text-slate-600">{answeredCount} / 75</td>
                        <td className="p-3 font-bold text-slate-900">{avg}</td>
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
        currentMode={filterMode}
        selectedStudentNumber={selectedStudentNumber}
        onClose={() => setSelectedScale(null)}
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
