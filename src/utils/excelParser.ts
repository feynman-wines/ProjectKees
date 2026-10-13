import * as XLSX from 'xlsx';
import { RespondentRecord } from '../types/survey';

export interface ParseResult {
  records: RespondentRecord[];
  groups: string[]; // List of unique groups, e.g. ["HAN", "304918", "418290"]
  hasHanGroup: boolean;
  totalRespondents: number;
  fileName: string;
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
  let groupColIdx = -1;
  let subjectColIdx = -1;
  let idColIdx = 0;
  const questionColMap: Record<number, number> = {}; // questionNumber -> columnIndex

  headerRow.forEach((col: any, idx: number) => {
    const colStr = String(col || '').trim().toLowerCase();
    if (colStr.includes('klas') || colStr.includes('groep') || colStr.includes('studentnummer')) {
      groupColIdx = idx;
    } else if (colStr.includes('vak') || colStr.includes('activiteit')) {
      subjectColIdx = idx;
    } else if (colStr.includes('leerling') || colStr.includes('id')) {
      idColIdx = idx;
    }

    // Match "Vraag 1", "Vraag 1 ", "V1", etc.
    const match = colStr.match(/(?:vraag|v)?\s*(\d+)/i);
    if (match) {
      const qNum = parseInt(match[1], 10);
      if (qNum >= 1 && qNum <= 75) {
        questionColMap[qNum] = idx;
      }
    }
  });

  // Fallback defaults if not found by header text
  if (groupColIdx === -1) groupColIdx = 1;
  if (subjectColIdx === -1) subjectColIdx = 2;

  // Fallback for question columns if headers weren't named "Vraag X"
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
    if (rawGroup === undefined || rawGroup === null || String(rawGroup).trim() === '') {
      continue;
    }

    const group = String(rawGroup).trim();
    const subject = subjectColIdx >= 0 && row[subjectColIdx] ? String(row[subjectColIdx]).trim() : undefined;
    const idVal = row[idColIdx] !== undefined ? parseInt(String(row[idColIdx]).replace(/\D/g, ''), 10) || r : r;

    const answers: Record<number, number> = {};
    let answerCount = 0;

    for (let q = 1; q <= 75; q++) {
      const colIdx = questionColMap[q];
      if (colIdx !== undefined && row[colIdx] !== undefined) {
        const numVal = parseFloat(String(row[colIdx]));
        if (!isNaN(numVal) && numVal >= 1 && numVal <= 5) {
          answers[q] = numVal;
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
    throw new Error('Geen geldige rijen met antwoorden (1 t/m 5) gevonden in het invoerblad.');
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

export function exportSummaryToExcel(
  comparisonData: { scaleName: string; category: string; ownScore: number | null; totalScore: number; hanScore: number; deltaWithTotal: number | null; deltaWithHan: number | null }[],
  currentGroupName: string
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

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Analyse Resultaten');
  XLSX.writeFile(wb, `Zelfregulatietool-analyse-${currentGroupName}.xlsx`);
}
