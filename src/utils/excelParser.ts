import * as XLSX from 'xlsx';
import { RespondentRecord } from '../types/survey';

import { ALL_QUESTIONS } from '../data/surveyDefinitions';

export interface ParseResult {
  records: RespondentRecord[];
  groups: string[]; // List of unique groups, e.g. ["HAN", "304918", "418290"]
  hasHanGroup: boolean;
  totalRespondents: number;
  fileName: string;
}

const LIKERT_TEXT_MAP: Record<string, number> = {
  'nooit': 1,
  'bijna nooit': 2,
  'soms': 3,
  'bijna altijd': 4,
  'altijd': 5,
  'helemaal niet akkoord': 1,
  'niet akkoord': 2,
  'ik weet het niet': 3,
  'akkoord': 4,
  'helemaal akkoord': 5,
};

function normalizeQuestionText(text: string): string {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[‘’'"“”….,?!():]/g, '');
}

function parseAnswerValue(raw: unknown): number | null {
  if (raw === undefined || raw === null) return null;
  const str = String(raw).trim();
  if (!str) return null;

  const mapped = LIKERT_TEXT_MAP[str.toLowerCase()];
  if (mapped !== undefined) return mapped;

  const numVal = Number(str);
  if (!Number.isNaN(numVal) && numVal >= 1 && numVal <= 5) {
    return numVal;
  }
  return null;
}

export function parseExcelWorkbook(data: ArrayBuffer | Uint8Array, fileName: string): ParseResult {
  const workbook = XLSX.read(data, { type: 'array' });

  // Find the appropriate sheet: 'Invoerblad' preferred, otherwise first sheet
  let sheetName = workbook.SheetNames.find(
    (name) => name.toLowerCase().includes('invoer') || name.toLowerCase().includes('data')
  );
  if (!sheetName) {
    sheetName = workbook.SheetNames[0];
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Geen geschikt werkblad gevonden in ${fileName}`);
  }

  // Convert to 2D array of rows
  const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });
  if (rawRows.length < 2) {
    throw new Error('Het Excel-werkblad bevat geen gegevensrijen.');
  }

  // Find header row (usually row 0)
  const headerRow = rawRows[0] || [];

  // Identify column indices
  let nummerColIdx = -1;
  let klasColIdx = -1;
  let subjectColIdx = -1;
  let idColIdx = 0;
  const questionColMap: Record<number, number> = {}; // questionNumber -> columnIndex

  const normalizedQuestionLookup = new Map<string, number>();
  ALL_QUESTIONS.forEach((q) => {
    normalizedQuestionLookup.set(normalizeQuestionText(q.text), q.number);
  });

  headerRow.forEach((col: any, idx: number) => {
    const colStr = String(col || '').trim().toLowerCase();
    if (colStr === 'nummer' || colStr.includes('studentnummer') || colStr.includes('groep')) {
      nummerColIdx = idx;
    } else if (colStr === 'klas' || colStr.includes('klas /')) {
      klasColIdx = idx;
    } else if (colStr.includes('vak') || colStr.includes('activiteit')) {
      subjectColIdx = idx;
    } else if (colStr === 'id' || colStr.includes('leerling')) {
      idColIdx = idx;
    }

    // Match "Vraag 1", "Vraag 1 ", "V1"
    const match = colStr.match(/^(?:vraag|v)\s*(\d+)$/i);
    if (match) {
      const qNum = parseInt(match[1], 10);
      if (qNum >= 1 && qNum <= 75) {
        questionColMap[qNum] = idx;
        return;
      }
    }

    // Match full Microsoft Forms question text
    const normCol = normalizeQuestionText(String(col || ''));
    const matchedQNum = normalizedQuestionLookup.get(normCol);
    if (matchedQNum !== undefined) {
      questionColMap[matchedQNum] = idx;
    }
  });

  const groupColIdx = nummerColIdx !== -1 ? nummerColIdx : klasColIdx !== -1 ? klasColIdx : 1;
  if (subjectColIdx === -1) subjectColIdx = 2;

  // Fallback for question columns if headers weren't matched
  if (Object.keys(questionColMap).length < 10) {
    for (let q = 1; q <= 75; q++) {
      questionColMap[q] = 2 + q; // Typically starts at col 3 (0-indexed)
    }
  }

  const records: RespondentRecord[] = [];
  const groupSet = new Set<string>();

  // Iterate over data rows
  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rawGroup = row[groupColIdx];
    const rawKlas = klasColIdx !== -1 ? row[klasColIdx] : undefined;
    const groupStr = rawGroup !== undefined && rawGroup !== null ? String(rawGroup).trim() : '';
    const klasStr = rawKlas !== undefined && rawKlas !== null ? String(rawKlas).trim() : '';

    if (!groupStr && !klasStr) {
      continue;
    }

    const isHan = groupStr.toUpperCase() === 'HAN' || klasStr.toUpperCase() === 'HAN';
    const group = isHan ? 'HAN' : groupStr || klasStr;
    if (!group) continue;

    const subject = subjectColIdx >= 0 && row[subjectColIdx] ? String(row[subjectColIdx]).trim() : undefined;
    const idVal = row[idColIdx] !== undefined ? parseInt(String(row[idColIdx]).replace(/\D/g, ''), 10) || r : r;

    const answers: Record<number, number> = {};
    let answerCount = 0;

    for (let q = 1; q <= 75; q++) {
      const colIdx = questionColMap[q];
      if (colIdx !== undefined) {
        const parsedVal = parseAnswerValue(row[colIdx]);
        if (parsedVal !== null) {
          answers[q] = parsedVal;
          answerCount++;
        }
      }
    }

    // Only keep if at least some questions were answered
    if (answerCount >= 3) {
      records.push({
        id: idVal,
        group,
        subject,
        answers,
      });
      groupSet.add(group);
    }
  }

  if (records.length === 0) {
    throw new Error('Geen geldige rijen met antwoorden (1 t/m 5 of schaalteksten) gevonden in het werkblad.');
  }

  const groups = Array.from(groupSet).sort((a, b) => {
    if (a.toUpperCase() === 'HAN') return -1;
    if (b.toUpperCase() === 'HAN') return 1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  return {
    records,
    groups,
    hasHanGroup: groups.some((g) => g.toUpperCase() === 'HAN'),
    totalRespondents: records.length,
    fileName,
  };
}

export interface QuestionExportRow {
  number: number;
  scale: string;
  text: string;
  ownScore: number | null;
  totalScore: number;
  hanScore: number;
  stdDev: number;
}

export function exportSummaryToExcel(
  comparisonData: { scaleName: string; category: string; ownScore: number | null; totalScore: number; hanScore: number; deltaWithTotal: number | null; deltaWithHan: number | null }[],
  currentGroupName: string,
  questionRows?: QuestionExportRow[]
) {
  const headers = ['Schaal', 'Categorie', `Score ${currentGroupName}`, 'Gemiddelde Totaal', 'Score HAN', 'Verschil met Totaal', 'Verschil met HAN'];
  const rows = comparisonData.map((item) => [
    item.scaleName,
    item.category,
    item.ownScore !== null ? item.ownScore : '-',
    item.totalScore,
    item.hanScore,
    item.deltaWithTotal !== null ? item.deltaWithTotal : '-',
    item.deltaWithHan !== null ? item.deltaWithHan : '-',
  ]);

  const wb = XLSX.utils.book_new();
  const wsScales = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  XLSX.utils.book_append_sheet(wb, wsScales, '15 Schalen');

  if (questionRows && questionRows.length > 0) {
    const qHeaders = ['Vraagnummer', 'Schaal', 'Stelling', `Score ${currentGroupName}`, 'Gemiddelde Totaal', 'Score HAN', 'Spreiding (SD)'];
    const qData = questionRows.map((q) => [
      q.number,
      q.scale,
      q.text,
      q.ownScore !== null ? q.ownScore : '-',
      q.totalScore,
      q.hanScore,
      q.stdDev,
    ]);
    const wsQuestions = XLSX.utils.aoa_to_sheet([qHeaders, ...qData]);
    XLSX.utils.book_append_sheet(wb, wsQuestions, '75 Vragen');
  }

  XLSX.writeFile(wb, `Zelfregulatietool-analyse-${currentGroupName}.xlsx`);
}
