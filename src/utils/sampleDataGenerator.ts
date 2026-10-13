import { RespondentRecord } from '../types/survey';

// Pseudo-random with seed for deterministic, realistic data
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateRealisticSampleDataset(): RespondentRecord[] {
  const records: RespondentRecord[] = [];
  let currentId = 1;

  // 1. Group "HAN" (25 teacher students)
  // Typically higher in planning, internal regulation, deep learning strategies
  for (let i = 1; i <= 25; i++) {
    const answers: Record<number, number> = {};
    for (let q = 1; q <= 75; q++) {
      const rand = seededRandom(i * 100 + q);
      // HAN students generally answer between 3 and 5, with occasionally 2
      let val = 4;
      if (rand < 0.15) val = 3;
      else if (rand < 0.30) val = 5;
      else if (rand < 0.85) val = 4;
      else val = 2;

      // Special scales adjustments for HAN:
      // Questions 11-14: Oppervlakkige leerstrategieën (HAN scores lower, ~2-3)
      if (q >= 11 && q <= 14) {
        val = rand < 0.4 ? 2 : rand < 0.8 ? 3 : 1;
      }
      // Questions 49-51: Externe regulatie (HAN scores lower, ~2.2)
      if (q >= 49 && q <= 51) {
        val = rand < 0.5 ? 2 : rand < 0.85 ? 3 : 1;
      }
      // Questions 60-62: Interne regulatie (HAN scores high, ~4.4)
      if (q >= 60 && q <= 62) {
        val = rand < 0.6 ? 5 : 4;
      }

      answers[q] = val;
    }

    records.push({
      id: currentId++,
      group: 'HAN',
      subject: 'Docentopleiding',
      answers,
    });
  }

  // 2. High school student cohorts per student teacher
  const studentCohorts = [
    { number: '304918', name: 'Klas 3 Havo (Student 304918)', size: 24, profile: 'balanced' },
    { number: '418290', name: 'Klas 2 Vwo (Student 418290)', size: 26, profile: 'high_motivated' },
    { number: '529104', name: 'Klas 3 Vmbo-tl (Student 529104)', size: 22, profile: 'struggling_planning' },
    { number: '683019', name: 'Klas 4 Havo (Student 683019)', size: 25, profile: 'high_external_regulation' },
  ];

  studentCohorts.forEach((cohort, cIdx) => {
    for (let i = 1; i <= cohort.size; i++) {
      const answers: Record<number, number> = {};
      for (let q = 1; q <= 75; q++) {
        const rand = seededRandom((cIdx + 1) * 1000 + i * 80 + q);

        let baseVal = 3;
        if (rand < 0.25) baseVal = 2;
        else if (rand < 0.65) baseVal = 3;
        else if (rand < 0.90) baseVal = 4;
        else baseVal = 5;

        // Apply profile characteristics
        if (cohort.profile === 'struggling_planning') {
          // Questions 7-10 (planning) lower
          if (q >= 7 && q <= 10) baseVal = rand < 0.5 ? 2 : rand < 0.8 ? 1 : 3;
          // Questions 49-51 (externe regulatie) higher
          if (q >= 49 && q <= 51) baseVal = rand < 0.6 ? 4 : 5;
        } else if (cohort.profile === 'high_motivated') {
          // Questions 15-24 (diepgaand) & 60-62 (intern) higher
          if ((q >= 15 && q <= 24) || (q >= 60 && q <= 62)) baseVal = rand < 0.4 ? 4 : rand < 0.8 ? 5 : 3;
        } else if (cohort.profile === 'high_external_regulation') {
          // Questions 49-55 (externe & geïntrojecteerde) higher
          if (q >= 49 && q <= 55) baseVal = rand < 0.5 ? 4 : rand < 0.85 ? 5 : 3;
          // Questions 45-48 (procesevaluatie) lower
          if (q >= 45 && q <= 48) baseVal = rand < 0.5 ? 2 : 3;
        }

        answers[q] = baseVal;
      }

      records.push({
        id: currentId++,
        group: cohort.number,
        subject: 'Middelbare School Klas',
        answers,
      });
    }
  });

  return records;
}
