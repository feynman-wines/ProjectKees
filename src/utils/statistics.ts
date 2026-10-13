import { RespondentRecord, ScaleDefinition, GroupStats, ComparisonItem } from '../types/survey';

export function calculateMean(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
}

export function calculateStdDev(numbers: number[], mean?: number): number {
  if (numbers.length <= 1) return 0;
  const m = mean !== undefined ? mean : calculateMean(numbers);
  const variance = numbers.reduce((acc, val) => acc + Math.pow(val - m, 2), 0) / (numbers.length - 1);
  return Math.sqrt(variance);
}

export function calculateCronbachAlpha(records: RespondentRecord[], questionNumbers: number[]): number {
  const k = questionNumbers.length;
  if (k <= 1 || records.length <= 2) return 0;

  // Item variances
  let sumItemVariances = 0;
  questionNumbers.forEach((qNum) => {
    const scores = records
      .map((r) => r.answers[qNum])
      .filter((s): s is number => typeof s === 'number' && s >= 1 && s <= 5);
    if (scores.length > 1) {
      const itemMean = calculateMean(scores);
      const itemVar = scores.reduce((sum, s) => sum + Math.pow(s - itemMean, 2), 0) / (scores.length - 1);
      sumItemVariances += itemVar;
    }
  });

  // Total scores per respondent
  const totalScores: number[] = [];
  records.forEach((r) => {
    let sum = 0;
    let validCount = 0;
    questionNumbers.forEach((qNum) => {
      const s = r.answers[qNum];
      if (typeof s === 'number' && s >= 1 && s <= 5) {
        sum += s;
        validCount++;
      }
    });
    if (validCount === k) {
      totalScores.push(sum);
    }
  });

  if (totalScores.length <= 1) return 0;

  const totalMean = calculateMean(totalScores);
  const totalVariance = totalScores.reduce((sum, s) => sum + Math.pow(s - totalMean, 2), 0) / (totalScores.length - 1);

  if (totalVariance <= 0) return 0;

  const alpha = (k / (k - 1)) * (1 - sumItemVariances / totalVariance);
  // Cap between 0 and 1
  return Math.max(0, Math.min(0.99, alpha));
}

export function calculateGroupStats(
  records: RespondentRecord[],
  groupName: string,
  displayName: string,
  scales: ScaleDefinition[]
): GroupStats {
  const respondentCount = records.length;
  const scaleAverages: Record<string, number> = {};
  const scaleStdDevs: Record<string, number> = {};
  const questionAverages: Record<number, number> = {};
  const questionStdDevs: Record<number, number> = {};
  const questionDistributions: Record<number, { 1: number; 2: number; 3: number; 4: number; 5: number }> = {};

  // Initialize questions
  for (let q = 1; q <= 75; q++) {
    const validScores: number[] = [];
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    records.forEach((r) => {
      const val = r.answers[q];
      if (typeof val === 'number' && val >= 1 && val <= 5) {
        validScores.push(val);
        const rounded = Math.round(val) as 1 | 2 | 3 | 4 | 5;
        if (dist[rounded] !== undefined) {
          dist[rounded]++;
        }
      }
    });

    const qMean = calculateMean(validScores);
    const qStd = calculateStdDev(validScores, qMean);

    questionAverages[q] = Number(qMean.toFixed(2));
    questionStdDevs[q] = Number(qStd.toFixed(2));
    questionDistributions[q] = dist;
  }

  // Calculate scales
  scales.forEach((scale) => {
    const scaleScores: number[] = [];
    records.forEach((r) => {
      const qVals = scale.questions
        .map((qNum) => r.answers[qNum])
        .filter((v): v is number => typeof v === 'number' && v >= 1 && v <= 5);
      if (qVals.length > 0) {
        scaleScores.push(calculateMean(qVals));
      }
    });

    const sMean = calculateMean(scaleScores);
    const sStd = calculateStdDev(scaleScores, sMean);

    scaleAverages[scale.name] = Number(sMean.toFixed(2));
    scaleStdDevs[scale.name] = Number(sStd.toFixed(2));
  });

  return {
    groupName,
    displayName,
    respondentCount,
    scaleAverages,
    scaleStdDevs,
    questionAverages,
    questionStdDevs,
    questionDistributions,
  };
}

export function buildComparisonList(
  ownGroupStats: GroupStats | null,
  totalStats: GroupStats,
  hanStats: GroupStats,
  scales: ScaleDefinition[]
): ComparisonItem[] {
  return scales.map((scale) => {
    const ownScore = ownGroupStats ? ownGroupStats.scaleAverages[scale.name] ?? null : null;
    const totalScore = totalStats.scaleAverages[scale.name] ?? 0;
    const hanScore = hanStats.scaleAverages[scale.name] ?? 0;

    const deltaWithTotal = ownScore !== null ? Number((ownScore - totalScore).toFixed(2)) : null;
    const deltaWithHan = ownScore !== null ? Number((ownScore - hanScore).toFixed(2)) : null;

    return {
      scaleId: scale.id,
      scaleName: scale.name,
      category: scale.category,
      ownScore,
      totalScore,
      hanScore,
      deltaWithTotal,
      deltaWithHan,
    };
  });
}
