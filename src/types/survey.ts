export interface QuestionItem {
  number: number;
  scale: string;
  text: string;
}

export type ScaleCategory = 'voorbereiding' | 'uitvoering' | 'reflectie' | 'motivatie' | 'zelfeffectiviteit';

export interface ScaleDefinition {
  id: string;
  name: string;
  shortName: string;
  category: ScaleCategory;
  categoryName: string;
  questions: number[];
  description: string;
  tips: string[];
}

export interface RespondentRecord {
  id: number;
  group: string; // "HAN" or student number like "304918"
  subject?: string;
  answers: Record<number, number>; // Question 1..75 -> 1..5
}

export interface GroupStats {
  groupName: string;
  displayName: string;
  respondentCount: number;
  scaleAverages: Record<string, number>;
  scaleStdDevs: Record<string, number>;
  questionAverages: Record<number, number>;
  questionStdDevs: Record<number, number>;
  questionDistributions: Record<number, { 1: number; 2: number; 3: number; 4: number; 5: number }>;
}

export interface ComparisonItem {
  scaleId: string;
  scaleName: string;
  category: ScaleCategory;
  ownScore: number | null;
  totalScore: number;
  hanScore: number;
  deltaWithTotal: number | null;
  deltaWithHan: number | null;
}
