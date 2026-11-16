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
    <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        {/* Doelgroep selectie tabs */}
        <div>
          <span className="block text-xs font-semibold text-zinc-500 mb-2">
            Selecteer doelgroep
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Eigen groep / studentnummer */}
            <button
              onClick={() => {
                onModeChange('student');
                if (!selectedStudentNumber && studentNumbers.length > 0) {
                  onStudentNumberChange(studentNumbers[0]);
                }
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'student'
                  ? 'bg-[#E50056] text-white'
                  : 'bg-zinc-100 text-[#111111] hover:bg-zinc-200 border border-zinc-200'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Eigen Klas (Studentnummer)</span>
              {mode === 'student' && selectedStudentNumber && (
                <span className="font-mono-nums text-xs opacity-90">
                  &middot; N = {ownCount}
                </span>
              )}
            </button>

            {/* 2. Totaal alle groepen */}
            <button
              onClick={() => onModeChange('total')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'total'
                  ? 'bg-[#111111] text-white'
                  : 'bg-zinc-100 text-[#111111] hover:bg-zinc-200 border border-zinc-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Totaal alle leerlingen</span>
              <span className="font-mono-nums text-xs opacity-80">
                &middot; N = {totalCount}
              </span>
            </button>

            {/* 3. Groep "HAN" */}
            <button
              onClick={() => onModeChange('han')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'han'
                  ? 'bg-[#111111] text-white ring-2 ring-[#E50056]'
                  : 'bg-zinc-100 text-[#111111] hover:bg-zinc-200 border border-zinc-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Groep "HAN" (Docenten)</span>
              <span className="font-mono-nums text-xs opacity-80">
                &middot; N = {hanCount}
              </span>
            </button>
          </div>
        </div>

        {/* Studentnummer selector & Benchmark toggle */}
        <div className="flex flex-wrap items-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
          {mode === 'student' && (
            <div className="relative">
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                Studentnummer
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between gap-3 px-3.5 py-2 bg-white border border-zinc-300 rounded-lg text-xs sm:text-sm font-semibold text-[#111111] hover:border-[#111111] transition-colors min-w-[200px] cursor-pointer"
              >
                <span className="truncate font-mono-nums">
                  {selectedStudentNumber ? `Student: ${selectedStudentNumber}` : 'Selecteer nummer...'}
                </span>
                <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-2">
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Zoek studentnummer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-[#E50056]"
                    />
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1">
                    {filteredStudentNumbers.length === 0 ? (
                      <p className="text-xs text-zinc-400 p-2 text-center">Geen studentnummers gevonden</p>
                    ) : (
                      filteredStudentNumbers.map((num) => (
                        <button
                          key={num}
                          onClick={() => {
                            onStudentNumberChange(num);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                            selectedStudentNumber === num
                              ? 'bg-[#E50056]/10 text-[#E50056] font-semibold'
                              : 'text-[#111111] hover:bg-zinc-100'
                          }`}
                        >
                          <span className="font-mono-nums">Studentnummer: {num}</span>
                          {selectedStudentNumber === num && (
                            <Check className="w-3.5 h-3.5 text-[#E50056] shrink-0" />
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
          <label
            htmlFor="benchmark-toggle"
            className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 px-3.5 py-2 rounded-lg cursor-pointer select-none hover:border-zinc-300 transition-colors"
          >
            <input
              type="checkbox"
              id="benchmark-toggle"
              checked={showBenchmark}
              onChange={(e) => onToggleBenchmark(e.target.checked)}
              className="w-4 h-4 accent-[#E50056] rounded-sm border-zinc-300 cursor-pointer"
            />
            <span className="text-xs font-semibold text-[#111111] whitespace-nowrap">
              Vergelijk met Totaal &amp; HAN
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
