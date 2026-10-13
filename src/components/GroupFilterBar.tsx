import React, { useState } from 'react';
import { Users, School, GraduationCap, Search, Check, ChevronDown } from 'lucide-react';

export type FilterMode = 'total' | 'han' | 'student';

interface GroupFilterBarProps {
  mode: FilterMode;
  selectedStudentNumber: string;
  studentNumbers: string[];
  totalCount: number;
  hanCount: number;
  ownCount: number;
  showBenchmark: boolean;
  onModeChange: (mode: FilterMode) => void;
  onStudentNumberChange: (studentNumber: string) => void;
  onToggleBenchmark: (show: boolean) => void;
}

export const GroupFilterBar: React.FC<GroupFilterBarProps> = ({
  mode,
  selectedStudentNumber,
  studentNumbers,
  totalCount,
  hanCount,
  ownCount,
  showBenchmark,
  onModeChange,
  onStudentNumberChange,
  onToggleBenchmark,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStudentNumbers = studentNumbers.filter((num) =>
    num.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Doelgroep selectie tabs */}
        <div>
          <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Selecteer Weergave / Doelgroep
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Totaal alle groepen */}
            <button
              onClick={() => onModeChange('total')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'total'
                  ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Totaal alle leerlingen</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                  mode === 'total' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                N = {totalCount}
              </span>
            </button>

            {/* 2. Groep "HAN" */}
            <button
              onClick={() => onModeChange('han')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'han'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Groep "HAN" (Docenten)</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
                  mode === 'han' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                N = {hanCount}
              </span>
            </button>

            {/* 3. Eigen groep / studentnummer */}
            <button
              onClick={() => {
                onModeChange('student');
                if (!selectedStudentNumber && studentNumbers.length > 0) {
                  onStudentNumberChange(studentNumbers[0]);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                mode === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Eigen Klas (Studentnummer)</span>
              {mode === 'student' && selectedStudentNumber && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-full font-medium bg-indigo-700 text-white">
                  N = {ownCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Studentnummer selector & Benchmark toggle */}
        <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          {/* Dropdown voor studentnummer */}
          {mode === 'student' && (
            <div className="relative">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Kies Studentnummer:
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-100 transition min-w-[190px] cursor-pointer"
              >
                <span className="truncate">
                  {selectedStudentNumber ? `Student: ${selectedStudentNumber}` : 'Selecteer nummer...'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2">
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Zoek studentnummer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1">
                    {filteredStudentNumbers.length === 0 ? (
                      <p className="text-xs text-slate-400 p-2 text-center">Geen studentnummers gevonden</p>
                    ) : (
                      filteredStudentNumbers.map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            onStudentNumberChange(num);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition cursor-pointer ${
                            selectedStudentNumber === num
                              ? 'bg-indigo-50 text-indigo-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>Studentnummer: {num}</span>
                          {selectedStudentNumber === num && (
                            <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Benchmark switch */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            <input
              type="checkbox"
              id="benchmark-toggle"
              checked={showBenchmark}
              onChange={(e) => onToggleBenchmark(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="benchmark-toggle" className="text-xs font-medium text-slate-700 cursor-pointer select-none">
              Toon Benchmark (Vergelijk met Totaal & HAN)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
